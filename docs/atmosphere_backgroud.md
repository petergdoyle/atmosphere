# Atmosphere Background

## The Vision
Atmosphere was conceived with a single, clear goal: to provide developers with a premium, lightweight, and frictionless AI coding experience powered entirely by local, open-source models. 

Instead of relying on cloud-based APIs like Gemini, OpenAI, or Claude, Atmosphere allows developers to utilize their own hardware. It acts as the bridge between the IDE and the homelab.

## Taglines
- Code at a higher altitude.
- The lightweight IDE with local intelligence.
- Intelligent coding, built on open space.

## Aesthetic Identity
The UI was meticulously designed to evoke a sense of vast space and high performance:
- **Colors**: High contrast but soft. Deep slate blues (`#0f172a`), cool grays (`#e2e8f0`), and subtle neon cyan accents (`#06b6d4`).
- **Logo**: A minimalist, gradient-filled circle (fading from deep space blue to cloud white) wrapped in a sleek, broken orbit line.
- **Vibe**: The AI should feel like the air you breathe—omnipresent but invisible, frictionless, and seamless.

## Backend Infrastructure
Atmosphere is explicitly designed to communicate with an Ollama instance hosted in a homelab environment. The target architecture involves:
- A Proxmox virtualization server.
- An LXC (Linux Container) running Docker.
- A Docker Compose stack defining the Ollama API layer and open web UI.
- (Optional) Hardware optimization, allowing Proxmox to route requests to dedicated AI accelerator hardware registered in the homelab.
