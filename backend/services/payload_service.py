import os
import random
import base64
from typing import Dict, List, Optional

class PayloadService:
    """
    Service to manage actual data files (payloads) for transmission.
    Simulates a satellite's onboard storage of scientific data, images, and logs.
    """
    def __init__(self, source_dir: str = "payload_source"):
        self.source_dir = source_dir
        self.files = []
        self._refresh_file_list()

    def _refresh_file_list(self):
        """Scan the source directory for files"""
        if not os.path.exists(self.source_dir):
            os.makedirs(self.source_dir)
            return

        self.files = [f for f in os.listdir(self.source_dir) if os.path.isfile(os.path.join(self.source_dir, f))]

    def get_random_payload(self) -> Optional[Dict]:
        """Pick a random file and return its metadata and content"""
        self._refresh_file_list()
        if not self.files:
            return None

        filename = random.choice(self.files)
        filepath = os.path.join(self.source_dir, filename)
        
        try:
            with open(filepath, "rb") as f:
                content = f.read()
                
            # For text files, we can send as string, for others as base64
            is_text = filename.endswith(('.json', '.txt', '.md', '.log'))
            
            return {
                "filename": filename,
                "size_bytes": len(content),
                "type": filename.split('.')[-1],
                "content": content.decode('utf-8', errors='ignore') if is_text else base64.b64encode(content).decode('utf-8')
            }
        except Exception as e:
            print(f"Error reading payload file {filename}: {e}")
            return None

payload_service = PayloadService()
