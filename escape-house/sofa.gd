extends Area2D

func _ready():
	add_to_group("interactable")

func interact():
	var dialogue_box = get_tree().current_scene.get_node("CanvasLayer/Control/DialogueBox")
	var dialogue_text = dialogue_box.get_node("DialogueText")
	var player = get_tree().get_first_node_in_group("player")

	# 🔴 If already open → close and stop
	if dialogue_box.visible:
		dialogue_box.visible = false
		return

	# 🟢 Open dialogue
	dialogue_box.visible = true

	if not player.sofa_checked:
		dialogue_text.text = "Dust layers the cushions. Something was hidden here once.. What was lost here was taken by the hands that no longer ticks"
		player.sofa_checked = true
	else:
		dialogue_text.text = "You've already checked the sofa. Something was hidden here once.. What was lost here was taken by the hands that no longer ticks"
