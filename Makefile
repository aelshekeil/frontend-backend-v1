.PHONY: help install dev test lint clean docker-build docker-up

help:
	@echo "Available commands:"
	@echo "  install     Install dependencies for both frontend and backend"
	@echo "  dev         Start development servers"
	@echo "  test        Run all tests"
	@echo "  lint        Run linting for both frontend and backend"
	@echo "  clean       Clean build artifacts"
	@echo "  docker-build Build Docker images"
	@echo "  docker-up   Start services with Docker Compose"

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev:
	@echo "Starting development servers..."
	docker-compose -f docker-compose.dev.yml up

test:
	@echo "Running backend tests..."
	cd backend && python -m pytest tests/ -v
	@echo "Running frontend tests..."
	cd frontend && npm test

lint:
	@echo "Linting backend code..."
	cd backend && flake8 app/ tests/
	cd backend && black app/ tests/ --check
	@echo "Linting frontend code..."
	cd frontend && npm run lint

clean:
	@echo "Cleaning build artifacts..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	cd frontend && rm -rf build/ dist/

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d
