extends Area2D

func _ready():
	add_to_group("interactable")

func interact():
	var dialogue_box = get_node("/root/Bedroom/CanvasLayer/Control/DialogueBox")
	var dialogue_text = dialogue_box.get_node("DialogueText")

	if dialogue_box.visible:
		dialogue_box.visible = false
	else:
		dialogue_box.visible = true
		dialogue_text.text = "your soul will be trapped here if you dont make it quickly now.."


func _on_body_entered(body: Node2D) -> void:
	pass # Replace with function body.

func _on_body_exited(body: Node2D) -> void:
	pass # Replace with function body.
