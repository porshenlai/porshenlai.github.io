import json
from aiohttp import web

# room: { "p1", "p2", "s1", "s2", "c1", "c2", "over", "mode", "winner_role", "win_limit" }
rooms = {}

async def websocket_handler(request):
	ws = web.WebSocketResponse()
	await ws.prepare(request)

	game_id = request.query.get('game', 'lobby')
	game_mode = request.query.get('mode', 'speed')

	if game_id not in rooms:
		rooms[game_id] = {
			"p1": None, "p2": None, "s1": None, "s2": None,
			"c1": 0, "c2": 0, "over": False, "mode": game_mode,
			"winner_candidate": None, "win_limit": 999
		}

	room = rooms[game_id]
	role = "p1" if room["p1"] is None else ("p2" if room["p2"] is None else None)

	if not role:
		await ws.send_json({"type": "error", "msg": "房間已滿"})
		await ws.close()
		return ws

	room[role] = ws
	await ws.send_json({"type": "init", "role": role, "mode": room["mode"]})

	async def broadcast(data):
		for p in [room["p1"], room["p2"]]:
			if p and not p.closed: await p.send_json(data)

	try:
		async for msg in ws:
			if msg.type == web.WSMsgType.TEXT:
				data = json.loads(msg.data)

				if data["type"] == "set_secret":
					if role == "p1": room["s1"] = data["val"]
					else: room["s2"] = data["val"]
					if room["s1"] and room["s2"]:
						await broadcast({"type": "start"})

				elif data["type"] == "guess" and not room["over"]:
					# 增加次數
					if role == "p1": room["c1"] += 1
					else: room["c2"] += 1

					my_count = room["c1"] if role == "p1" else room["c2"]
					target = room["s2"] if role == "p1" else room["s1"]

					# 計算 AB
					a, b = 0, 0
					for i in range(4):
						if data["val"][i] == target[i]: a += 1
						elif data["val"][i] in target: b += 1

					await broadcast({"type": "res", "role": role, "guess": data["val"], "a": a, "b": b, "count": my_count})

					# --- 勝負判定邏輯 ---
					if room["mode"] == "speed":
						if a == 4:
							room["over"] = True
							await broadcast({"type": "over", "winner": f"🏁 {role.upper()} 速度較快，獲得勝利！"})

					else: # moves 模式
						# 如果有人猜中
						if a == 4:
							# 如果你是第一個猜中的
							if room["winner_candidate"] is None:
								room["winner_candidate"] = role
								room["win_limit"] = my_count
								await broadcast({"type": "status", "msg": f"⚠️ {role.upper()} 已達成 4A (用了 {my_count} 次)！對手若不在次數內達成即輸。"})
							# 如果你是第二個猜中的 (比次數)
							else:
								room["over"] = True
								if my_count < room["win_limit"]:
									await broadcast({"type": "over", "winner": f"🎯 {role.upper()} 以更少的次數 ({my_count} 次) 逆轉勝！"})
								elif my_count == room["win_limit"]:
									await broadcast({"type": "over", "winner": "🤝 平手！雙方次數相同。"})
								else:
									await broadcast({"type": "over", "winner": f"🎯 {room['winner_candidate'].upper()} 次數較少，獲得勝利！"})

						# 如果沒猜中，但次數已經超過了領先者的次數
						elif my_count >= room["win_limit"] and room["winner_candidate"] != role:
							room["over"] = True
							await broadcast({"type": "over", "winner": f"⌛ {room['winner_candidate'].upper()} 獲勝！對手已用完相同次數。"})

	finally:
		room[role] = None
		if not room["p1"] and not room["p2"]: rooms.pop(game_id, None)

	return ws

app = web.Application()
app.router.add_get('/ws', websocket_handler)
app.router.add_get('/', lambda r: web.FileResponse('./index.html'))
web.run_app(app, port=8080)
