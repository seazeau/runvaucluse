import sys
import os
import cv2
import numpy as np

# Read frame count from argv
out_file = sys.argv[1] if len(sys.argv) > 1 else 'test_pipe.mp4'
W, H = 720, 1280
FPS = 30

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
writer = cv2.VideoWriter(out_file, fourcc, FPS, (W, H))

total_written = 0
stdin = sys.stdin.buffer

while True:
    # Read 4-byte length prefix
    len_bytes = stdin.read(4)
    if not len_bytes or len(len_bytes) < 4:
        break
    length = int.from_bytes(len_bytes, byteorder='big')
    
    # Read JPEG bytes
    jpeg_data = stdin.read(length)
    if len(jpeg_data) < length:
        break
        
    nparr = np.frombuffer(jpeg_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is not None:
        writer.write(frame)
        total_written += 1
        if total_written % 60 == 0:
            sys.stderr.write(f"Frame {total_written}/720\n")
            sys.stderr.flush()

writer.release()
sys.stderr.write(f"Done! Written {total_written} frames to {out_file}\n")
