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
		dialogue_text.text = " 📝 I rest on four legs below,
And one soft place where dreams go.Add them up, that’s all you do…
What number comes to you?    [Found the answer?...that feels right. But something still shines in the night.]"

func _on_body_entered(body: Node2D) -> void:
	pass # Replace with function body.

func _on_body_exited(body: Node2D) -> void:
	pass # Replace with function body.
