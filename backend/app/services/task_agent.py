
##Will Be Replaced by AI agent
def generate_task(track: str, level: str):
    return {
        "title": f"{track.capitalize()} Task",
        "description": f"Do a {level} level task for {track}.",
        "difficulty": level
    }