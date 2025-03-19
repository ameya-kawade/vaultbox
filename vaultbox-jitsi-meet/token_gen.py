import jwt
import time

def generate_awt_token():
    # Get current Unix timestamp
    current_time = int(time.time())
    
    # Set token payload
    payload = {
        "context": {
            "user": {
                "avatar": "your_avatar_url",
                "name": "your__name",
                "email": "your__email",
                "lobby_bypass": False
            }
        },
        "aud": "jitsi",
        "iss": "jitsi",
        "sub": "jitsi-meet.example.com",
        "room": "*",
        "nbf": current_time,
        "exp": current_time + 86400  # 24 hours later
    }

    # Secret key used for signing the JWT (change to your secret key)
    secret_key = "secret_token"

    # Generate JWT token using HS256 algorithm
    token = jwt.encode(payload, secret_key, algorithm="HS256")

    return token

# Generate and print the token
token = generate_awt_token()
print(f"Generated JWT Token: {token}")

