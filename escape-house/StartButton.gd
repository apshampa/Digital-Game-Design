extends Button

@onready var start_sound = $"../StartSound"

func _pressed():

	start_sound.play()

	await start_sound.finished

	get_tree().change_scene_to_file("res://Hall.tscn")


func _on_pressed() -> void:
	pass # Replace with function body.
