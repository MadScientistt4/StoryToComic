import sys
import pollinations

if __name__ == "__main__":
    try:
        prompt = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else "output.png"
        
        image = pollinations.Image(
            width=1024,
            height=1024
        )(prompt=prompt).save(output_file)
        
        print(output_file)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
