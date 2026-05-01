extends Control

@onready var click_sound = $ClickSound

func _ready():
	$StartButton.pressed.connect(_on_start_pressed)

func _on_start_pressed():
	print("CLICK WORKS")

	# 🔊 PLAY SOUND
	if click_sound:
		click_sound.play()

	# ⏳ small delay so sound is heard
	await get_tree().create_timer(0.1).timeout

	# 🎮 change scene
	get_tree().change_scene_to_file("res://Hall.tscn")

func _on_start_button_pressed() -> void:
	pass # Replace with function body.
