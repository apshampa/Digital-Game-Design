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
		dialogue_text.text = "Heavy nights leave heavy marks.  📝 But dreams never stay on the surface, look where they rest above it."

func _on_body_entered(body: Node2D) -> void:
	pass # Replace with function body.

func _on_body_exited(body: Node2D) -> void:
	pass # Replace with function body.
