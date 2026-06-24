// 실시간 건배방 클라이언트 단위 테스트 — 메시지 분기·join 송신·종료 시 재연결 정지.
//   ※ 프롬프트 [테스트]의 2탭 동시 '짠'·roster 갱신 실측은 phonesul-server 구동이 필요한
//     플랫폼 의존 검증(S3, 사람 게이트)이다. 여기선 통신 세부 없이 클라이언트 로직만 검증.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoomClient, createRoom, closeRoom } from './realtimeRoom.js'

// 제어 가능한 WebSocket mock.
class MockWS {
  static instances = []
  constructor(url) {
    this.url = url
    this.readyState = 0 // CONNECTING
    this.sent = []
    MockWS.instances.push(this)
  }
  send(data) {
    this.sent.push(data)
  }
  close() {
    this.readyState = 3
    this.onclose?.({})
  }
  // 테스트 헬퍼
  _open() {
    this.readyState = 1
    this.onopen?.({})
  }
  _msg(obj) {
    this.onmessage?.({ data: JSON.stringify(obj) })
  }
}
MockWS.OPEN = 1

beforeEach(() => {
  MockWS.instances = []
  vi.stubGlobal('WebSocket', MockWS)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('createRoomClient', () => {
  it('참여자는 토큰 없이 /ws/{code}로 연결한다(연결=join, 별도 메시지 없음)', () => {
    const client = createRoomClient({})
    client.connect('ABCD')
    const ws = MockWS.instances[0]
    expect(ws.url).toContain('/ws/ABCD')
    expect(ws.url).not.toContain('host_token')
    ws._open()
    expect(ws.sent).toHaveLength(0)
  })

  it('방장은 ?host_token= 를 붙여 연결한다', () => {
    const client = createRoomClient({})
    client.connect('ABCD', 'HOSTTOK')
    const ws = MockWS.instances[0]
    expect(ws.url).toContain('/ws/ABCD')
    expect(ws.url).toContain('host_token=HOSTTOK')
  })

  it('roster 수신 시 onRoster로 목록을 전달한다(F-RT-04)', () => {
    const onRoster = vi.fn()
    const client = createRoomClient({ onRoster })
    client.connect('R1')
    const ws = MockWS.instances[0]
    ws._open()
    ws._msg({ type: 'roster', members: ['a', 'b'] })
    expect(onRoster).toHaveBeenCalledWith(['a', 'b'])
  })

  it('cheers 수신 시 onCheers를 부른다(F-RT-05)', () => {
    const onCheers = vi.fn()
    const client = createRoomClient({ onCheers })
    client.connect('R1')
    MockWS.instances[0]._open()
    MockWS.instances[0]._msg({ type: 'cheers' })
    expect(onCheers).toHaveBeenCalledTimes(1)
  })

  it('sendCheers는 type:cheers를 송신한다 — 집계·순위 정보 없음(비게임)', () => {
    const client = createRoomClient({})
    client.connect('R1')
    const ws = MockWS.instances[0]
    ws._open()
    client.sendCheers()
    expect(ws.sent).toContain(JSON.stringify({ type: 'cheers' }))
  })

  it('sendLeave는 type:leave를 송신한다(보낸 사람만 퇴장)', () => {
    const client = createRoomClient({})
    client.connect('R1')
    const ws = MockWS.instances[0]
    ws._open()
    client.sendLeave()
    expect(ws.sent).toContain(JSON.stringify({ type: 'leave' }))
  })

  it('error 수신 시 onError로 메시지를 전달한다(code 없으면 message 폴백)', () => {
    const onError = vi.fn()
    const client = createRoomClient({ onError })
    client.connect('R1')
    MockWS.instances[0]._open()
    MockWS.instances[0]._msg({ type: 'error', message: '만료된 코드' })
    expect(onError).toHaveBeenCalledWith('만료된 코드')
  })

  it('error code를 사용자 문구로 매핑한다', () => {
    const onError = vi.fn()
    const client = createRoomClient({ onError })
    client.connect('R1')
    MockWS.instances[0]._open()
    MockWS.instances[0]._msg({ type: 'error', code: 'room_full' })
    expect(onError).toHaveBeenCalledWith('방 인원이 가득 찼어요')
  })

  it('room_closed 수신 시 onRoomClosed(reason)를 부르고 재연결하지 않는다', () => {
    vi.useFakeTimers()
    const onRoomClosed = vi.fn()
    const client = createRoomClient({ onRoomClosed })
    client.connect('R1')
    const ws = MockWS.instances[0]
    ws._open()
    ws._msg({ type: 'room_closed', reason: 'host_ended' })
    expect(onRoomClosed).toHaveBeenCalledWith('host_ended')
    vi.advanceTimersByTime(10000)
    expect(MockWS.instances.length).toBe(1) // 재연결 없음
  })

  it('close 후에는 재연결하지 않는다(F-RT-06)', () => {
    vi.useFakeTimers()
    const client = createRoomClient({})
    client.connect('R1')
    MockWS.instances[0]._open()
    client.close() // 사용자 의도 종료
    vi.advanceTimersByTime(10000)
    expect(MockWS.instances.length).toBe(1) // 새 소켓 없음
  })

  it('의도치 않은 끊김은 백오프로 재연결한다(F-RT-07)', () => {
    vi.useFakeTimers()
    const onStatus = vi.fn()
    const client = createRoomClient({ onStatus })
    client.connect('R1')
    MockWS.instances[0]._open()
    MockWS.instances[0].onclose?.({}) // 비정상 종료
    expect(onStatus).toHaveBeenCalledWith('reconnecting')
    vi.advanceTimersByTime(600)
    expect(MockWS.instances.length).toBe(2) // 재연결 시도
  })
})

describe('createRoom', () => {
  it('POST /rooms 응답에서 코드를 추출한다(F-RT-01)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ code: 'XYZ9', hostToken: 't1' }),
    })))
    const room = await createRoom()
    expect(room.code).toBe('XYZ9')
    expect(room.hostToken).toBe('t1')
  })

  it('실패 응답이면 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })))
    await expect(createRoom()).rejects.toThrow()
  })
})

describe('closeRoom', () => {
  it('POST /rooms/{code}/close 에 X-Host-Token 헤더를 보낸다', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ status: 'closed', code: 'R1' }) }))
    vi.stubGlobal('fetch', fetchMock)
    const res = await closeRoom('R1', 'TOK')
    expect(res.status).toBe('closed')
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toContain('/rooms/R1/close')
    expect(opts.method).toBe('POST')
    expect(opts.headers['X-Host-Token']).toBe('TOK')
  })

  it('실패(404 등)면 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })))
    await expect(closeRoom('R1', 'BAD')).rejects.toThrow()
  })
})
