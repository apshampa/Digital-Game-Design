extends Area2D

func _ready():
	add_to_group("interactable")

func interact():
	var dialogue_box = get_node("/root/Bedroom/CanvasLayer/Control/DialogueBox")
	var dialogue_text = dialogue_box.get_node("DialogueText")

	# TOGGLE behavior
	if dialogue_box.visible:
		dialogue_box.visible = false
	else:
		dialogue_box.visible = true
		dialogue_text.text = "The light is gone, the path is done.Now turn to where things are kept. 📝 In quiet stacks, secrets are swept.”"

func _on_body_entered(body: Node2D) -> void:
	pass # Replace with function body.

func _on_body_exited(body: Node2D) -> void:
	pass # Replace with function body.
