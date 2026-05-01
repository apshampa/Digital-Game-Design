extends Area2D

func _ready():
	add_to_group("interactable")

func interact():
	var dialogue_box = get_node("/root/Kitchen/CanvasLayer/Control/DialogueBox")
	var dialogue_text = dialogue_box.get_node("DialogueText")

	# TOGGLE behavior
	if dialogue_box.visible:
		dialogue_box.visible = false
	else:
		dialogue_box.visible = true
		dialogue_text.text = " 📝 When the table waits for hungry souls, count the silent circles of supper.....[If you stop now, it'll keep you. LEAVE THIS PLACE!]  "


func _on_body_entered(body: Node2D) -> void:
	pass # Replace with function body.


func _on_body_exited(body: Node2D) -> void:
	pass # Replace with function body.
