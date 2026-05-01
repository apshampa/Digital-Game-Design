extends Area2D

func _ready():
	add_to_group("interactable")

func interact():
	var dialogue_box = get_node("/root/Kitchen/CanvasLayer/Control/DialogueBox")
	var dialogue_text = dialogue_box.get_node("DialogueText")

	if dialogue_box.visible:
		dialogue_box.visible = false
	else:
		dialogue_box.visible = true
		dialogue_text.text = "where cold burns souls...But not the place you're looking for.."


func _on_body_entered(body: Node2D) -> void:
	pass # Replace with function body.


func _on_body_exited(body: Node2D) -> void:
	pass # Replace with function body.
