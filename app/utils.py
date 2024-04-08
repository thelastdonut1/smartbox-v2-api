from pathlib import Path
import socket
import random
import string

def is_safe_path(base_dir, user_path):
    try:
        # Resolve the path to its absolute form and ensure it exists within the base directory
        base_path = Path(base_dir).resolve(strict=True)
        target_path = (base_path / user_path).resolve(strict=False)
        result = base_path in target_path.parents or target_path == base_path
        return result
    except FileNotFoundError:
        # Handle the case where the path does not exist
        return False
    
def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

if __name__ == '__main__':
    rand_str = generate_random_string(64)
    print(rand_str)