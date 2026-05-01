extends Control

var has_won = false

@onready var click_sound = $ClickSound  

func _ready():
	# Set button text based on result
	if has_won:
		$ReplayButton.text = "YOU ESCAPED\n(REPLAY)"
	else:
		$ReplayButton.text = "YOU ARE TRAPPED\n(REPLAY)"

	# Connect button
	$ReplayButton.pressed.connect(_on_replay_button_pressed)


func _on_replay_button_pressed():
	# Play click sound
	if click_sound:
		click_sound.play()

	# Small delay so sound is heard
	await get_tree().create_timer(0.1).timeout

	# Go back to main menu
	get_tree().change_scene_to_file("res://main_menu.tscn")
