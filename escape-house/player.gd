extends CharacterBody2D

@export var speed = 160

@onready var anim = $AnimatedSprite2D

var interactables = []
var has_key=false
var sofa_checked = false

func _ready():
	add_to_group("player")
	
func _physics_process(delta):
	var direction = Vector2.ZERO

	if Input.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D):
		direction.x += 1
	if Input.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A):
		direction.x -= 1
	if Input.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S):
		direction.y += 1
	if Input.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W):
		direction.y -= 1

	velocity = direction.normalized() * speed
	move_and_slide()

	# 🎮 ANIMATION LOGIC (ADD THIS BELOW movement)
	if direction != Vector2.ZERO:
		anim.play("walk")

		# Flip left/right
		if direction.x > 0:
			anim.flip_h = false
		elif direction.x < 0:
			anim.flip_h = true
	else:
		anim.stop()  # or anim.play("idle") if you make idle animation

func _process(delta):
	if Input.is_action_just_pressed("interact"):
		print("E pressed")  # DEBUG
		interact()

func interact():
	if interactables.size() > 0:
		var obj = interactables[0]
		print("Interacting with:", obj.name)

		if obj.has_method("interact"):
			obj.interact()

# ✅ CORRECT SIGNALS
func _on_interaction_area_area_entered(area: Area2D) -> void:
	print("Entered:", area.name)
	if area.is_in_group("interactable"):
		interactables.append(area)

func _on_interaction_area_area_exited(area: Area2D) -> void:
	print("Exited:", area.name)
	if area.is_in_group("interactable"):
		interactables.erase(area)
