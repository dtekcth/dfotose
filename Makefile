up-prod:
	docker compose -f docker-compose.yml -f docker-compose-prod.yml up -d

up-dev:
	docker compose -f docker-compose.yml -f docker-compose-dev.yml up
