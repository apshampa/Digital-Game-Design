extends Node2D

var clue_active = false

func _ready():
	show_start_clue()

func show_start_clue():
	var dialogue_box = $CanvasLayer/Control/DialogueBox
	var dialogue_text = dialogue_box.get_node("DialogueText")

	dialogue_box.visible = true
	dialogue_text.text = "This room hold restless nights, look where sleep once stayed the longest."

	clue_active = true  # enable closing with E


func _process(delta):
	if clue_active and Input.is_action_just_pressed("interact"):
		close_clue()

func close_clue():
	var dialogue_box = $CanvasLayer/Control/DialogueBox
	dialogue_box.visible = false
	clue_active = false
	
func go_to_end_screen(win: bool):
	var end_scene = load("res://EndScreen.tscn").instantiate()
	end_scene.has_won = win

	get_tree().root.add_child(end_scene)
	get_tree().current_scene.queue_free()
	get_tree().current_scene = end_scene
