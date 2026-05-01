extends CanvasLayer

var game_over = false  

func _process(_delta):
	if game_over:
		return

	var time = int(GameManager.time_left)

	var minutes = time / 60
	var seconds = time % 60

	$TimerText.text = str(minutes).pad_zeros(2) + ":" + str(seconds).pad_zeros(2)

	# 🔴 CHECK TIME OVER
	if time <= 0:
		game_over = true
		print("TIME UP")  # debug
		get_tree().current_scene.go_to_end_screen(false)
