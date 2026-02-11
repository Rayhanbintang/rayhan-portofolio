# Create Custom Rayhan Assistant Model

## Steps to create the specialized model:

1. Copy the modelfile to your VM:
```bash
# Upload rayhan-assistant.modelfile to your VM
```

2. Create the custom model:
```bash
ollama create rayhan-assistant -f rayhan-assistant.modelfile
```

3. Test it:
```bash
ollama run rayhan-assistant "What are Rayhan's AWS certifications?"
```

4. Update Vercel environment variable:
```
OLLAMA_MODEL=rayhan-assistant
```

## Benefits:
- Faster responses (no huge system prompt every time)
- Model "knows" all your info permanently
- More consistent answers
- Less token usage

## To update the model later:
Just edit the modelfile and recreate:
```bash
ollama create rayhan-assistant -f rayhan-assistant.modelfile
```
