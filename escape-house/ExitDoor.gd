extends Area2D

@export var next_scene : String

var correct_code = "517"
var input_code = ""
var unlocked = false
var is_transitioning = false

func _ready():
	add_to_group("interactable")

func interact():
	await get_tree().process_frame   # ensures scene fully loaded

	var dialogue_box = get_tree().current_scene.get_node("CanvasLayer/Control/DialogueBox")

	if dialogue_box == null:
		print("DialogueBox not found!")
		return

	var dialogue_text = dialogue_box.get_node("DialogueText")

	if is_transitioning:
		return

	dialogue_box.visible = true

	# If already unlocked → go directly
	if unlocked:
		enter_bedroom(dialogue_text)
		return

	# Start code input
	input_code = ""
	dialogue_text.text = "Order clue: Sleep-stack-hung. ENTER CODE: _ _ _"

	await get_code_input(dialogue_text)


# 🔢 HANDLE INPUT
func get_code_input(dialogue_text):

	while input_code.length() < 3:
		await get_tree().process_frame

		if Input.is_key_pressed(KEY_1): add_digit("1", dialogue_text)
		elif Input.is_key_pressed(KEY_2): add_digit("2", dialogue_text)
		elif Input.is_key_pressed(KEY_3): add_digit("3", dialogue_text)
		elif Input.is_key_pressed(KEY_4): add_digit("4", dialogue_text)
		elif Input.is_key_pressed(KEY_5): add_digit("5", dialogue_text)
		elif Input.is_key_pressed(KEY_6): add_digit("6", dialogue_text)
		elif Input.is_key_pressed(KEY_7): add_digit("7", dialogue_text)
		elif Input.is_key_pressed(KEY_8): add_digit("8", dialogue_text)
		elif Input.is_key_pressed(KEY_9): add_digit("9", dialogue_text)
		elif Input.is_key_pressed(KEY_0): add_digit("0", dialogue_text)

		await get_tree().create_timer(0.2).timeout


	check_code(dialogue_text)


# ➕ ADD DIGIT
func add_digit(digit, dialogue_text):
	if input_code.length() >= 3:
		return

	input_code += digit
	update_display(dialogue_text)


# 🧾 UPDATE DISPLAY
func update_display(dialogue_text):
	var display = ""

	for i in range(input_code.length()):
		display += input_code[i] + " "

	for i in range(3 - input_code.length()):
		display += "_ "

	dialogue_text.text = "Order clue: Sleep-stack-hung. ENTER CODE: " + display


# 🔐 CHECK CODE
func check_code(dialogue_text):
	if input_code == correct_code:
		unlocked = true
		enter_bedroom(dialogue_text)
	else:
		dialogue_text.text = "Wrong code."

		await get_tree().create_timer(1.0).timeout

		dialogue_text.text = "Order clue: Sleep-stack-hung. ENTER CODE: _ _ _"
		input_code = ""
		await get_code_input(dialogue_text)


# 🚪 AUTO ENTER BEDROOM
func enter_bedroom(dialogue_text):
	is_transitioning = true

	dialogue_text.text = "Correct code..."

	await get_tree().create_timer(1.0).timeout

	dialogue_text.text = "The bedroom door unlocks..."

	await get_tree().create_timer(1.0).timeout

	dialogue_text.text = "You managed to ESCAPE!"

	await get_tree().create_timer(0.8).timeout

	print("Trying to change scene to: ", next_scene)   # 👈 DEBUG

	get_tree().change_scene_to_file(next_scene)
	
	next_scene = "res://EndScreen.tscn"	


func _on_body_entered(body: Node2D) -> void:
	pass # Replace with function body.


func _on_body_exited(body: Node2D) -> void:
	pass # Replace with function body.
