extends Area2D

var key_taken = false

func _ready():
	add_to_group("interactable")

func interact():
	var dialogue_box = get_tree().current_scene.get_node("CanvasLayer/Control/DialogueBox")
	var dialogue_text = dialogue_box.get_node("DialogueText")
	var player = get_tree().get_first_node_in_group("player")

	if dialogue_box.visible:
		dialogue_box.visible = false
		return

	dialogue_box.visible = true

	# ❌ Player hasn't checked sofa yet
	if not player.sofa_checked:
		dialogue_text.text = "Just an old clock... nothing unusual. You need to be somewhere else first.."
		return

	# ✅ Sofa checked → now allow key
	if not key_taken:
		dialogue_text.text = "*THUD* the clock drops..🗝️you found a small key hidden beneath the clock! TICK TOCK!!Hurry before this house claims yet another soul.."
		player.has_key = true
		GameManager.start_timer()   # ⏱ START TIMER HERE
		key_taken = true
	else:
		dialogue_text.text = "Nothing else behind the clock."
