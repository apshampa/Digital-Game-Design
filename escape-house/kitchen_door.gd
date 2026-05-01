extends Area2D

@export var next_scene : String

func _ready():
	add_to_group("interactable")

func interact():
	var dialogue_box = get_node("/root/Hall/CanvasLayer/Control/DialogueBox")
	var dialogue_text = dialogue_box.get_node("DialogueText")
	var player = get_node("/root/Hall/hall/player")

	# If dialogue already open → close it
	if dialogue_box.visible:
		dialogue_box.visible = false
		return

	dialogue_box.visible = true

	if player.has_key:
		dialogue_text.text = "You unlocked the door..."

		await get_tree().create_timer(1.2).timeout

		dialogue_text.text = "The door creaks open..."

		await get_tree().create_timer(0.75).timeout

		get_tree().change_scene_to_file(next_scene)

	else:
		dialogue_text.text = "The door is locked. I need a key."
		
	next_scene = "res://Kitchen.tscn"	
