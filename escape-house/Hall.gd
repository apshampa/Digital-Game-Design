extends Node2D

var clue_active = false

func _ready():
	show_start_clue()

func show_start_clue():
	var dialogue_box = $CanvasLayer/Control/DialogueBox
	var dialogue_text = dialogue_box.get_node("DialogueText")

	dialogue_box.visible = true
	dialogue_text.text = " 📝 This house has been waiting. If you wish to leave, begin where the weary bodies once rested."

	clue_active = true  # enable closing with E


func _process(delta):
	if clue_active and Input.is_action_just_pressed("interact"):
		close_clue()

func close_clue():
	var dialogue_box = $CanvasLayer/Control/DialogueBox
	dialogue_box.visible = false
	clue_active = false
