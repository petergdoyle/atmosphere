.PHONY: help env compile watch lint clean package install

.DEFAULT_GOAL := help

help:
	@echo "Atmosphere IDE Extension Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  env      Verify Node.js/npm, VS Code, and install npm dependencies"
	@echo "  compile  Compile TypeScript files"
	@echo "  watch    Compile TypeScript files in watch mode"
	@echo "  lint     Run ESLint checks"
	@echo "  clean    Remove build outputs ('out/') and 'node_modules/'"
	@echo "  package  Package the extension into a local VSIX bundle"
	@echo "  install  Package and install the extension into your local VS Code"
	@echo "  help     Display this help message"

env:
	@echo "Checking for Node.js..."
	@if ! command -v node >/dev/null 2>&1; then \
		echo "Node.js not found. Installing via Homebrew..."; \
		if ! command -v brew >/dev/null 2>&1; then \
			echo "Error: Homebrew is not installed. Please install Homebrew or Node.js manually."; \
			exit 1; \
		fi; \
		brew install node; \
	else \
		echo "Node.js is already installed: $$(node -v)"; \
	fi
	@echo "Checking for Visual Studio Code..."
	@if ! command -v code >/dev/null 2>&1 && [ ! -d "/Applications/Visual Studio Code.app" ]; then \
		echo "Visual Studio Code not found. Installing via Homebrew Cask..."; \
		if ! command -v brew >/dev/null 2>&1; then \
			echo "Error: Homebrew is not installed. Please install Homebrew or VS Code manually."; \
			exit 1; \
		fi; \
		brew install --cask visual-studio-code; \
	else \
		echo "Visual Studio Code is already installed."; \
	fi
	@$(MAKE) node_modules

node_modules: package.json
	@echo "Installing npm dependencies..."
	npm install
	@touch node_modules

compile: node_modules
	npm run compile

watch: node_modules
	npm run watch

lint: node_modules
	npm run lint

clean:
	rm -rf out node_modules *.vsix

package: compile
	npx @vscode/vsce package --no-git-tag-version --allow-missing-repository

install: package
	@echo "Installing extension into VS Code..."
	@if command -v code >/dev/null 2>&1; then \
		code --install-extension atmosphere-0.0.1.vsix; \
	elif [ -f "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" ]; then \
		"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension atmosphere-0.0.1.vsix; \
	else \
		echo "Error: 'code' command line tool not found."; \
		echo "Please open VS Code, open the Command Palette (Cmd+Shift+P),"; \
		echo "search for 'Shell Command: Install 'code' command in PATH',"; \
		echo "and run it, then run 'make install' again."; \
		exit 1; \
	fi
