extends Node

var time_left = 420   # 7 minutes
var timer_running = false

func start_timer():
	timer_running = true

func _process(delta):
	if timer_running:
		time_left -= delta

		if time_left <= 0:
			timer_running = false
			time_left = 0
			game_over()

func game_over():
	print("TIME UP!")
	get_tree().change_scene_to_file("res://Defeat.tscn")
