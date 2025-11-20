#!/bin/bash

# Script to monitor container health and auto-restart if unhealthy
# Usage: ./scripts/monitor-container.sh

CONTAINER_NAME="tat-api-services-tat-api-1"
CHECK_INTERVAL=60  # Check every 60 seconds
MAX_UNHEALTHY_COUNT=3  # Restart after 3 consecutive unhealthy checks
unhealthy_count=0

echo "Starting container health monitor for $CONTAINER_NAME"
echo "Check interval: ${CHECK_INTERVAL}s"
echo "Max unhealthy count before restart: ${MAX_UNHEALTHY_COUNT}"
echo ""

while true; do
  # Check if container is running
  if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "$(date): Container is not running. Attempting to start..."
    docker start "$CONTAINER_NAME" 2>/dev/null || docker-compose up -d
    unhealthy_count=0
    sleep 10
    continue
  fi

  # Check container health status
  health_status=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null)
  
  # If no health check configured, test manually
  if [ "$health_status" == "" ] || [ "$health_status" == "<no value>" ]; then
    # Manual health check - test if port 3000 responds
    if curl -f -s http://localhost:3000/api/v1/ > /dev/null 2>&1; then
      if [ $unhealthy_count -gt 0 ]; then
        echo "$(date): Container is healthy again (manual check)"
        unhealthy_count=0
      fi
    else
      unhealthy_count=$((unhealthy_count + 1))
      echo "$(date): Container is unhealthy (manual check) - Count: $unhealthy_count/$MAX_UNHEALTHY_COUNT"
      
      if [ $unhealthy_count -ge $MAX_UNHEALTHY_COUNT ]; then
        echo "$(date): Container unhealthy for too long. Restarting..."
        docker restart "$CONTAINER_NAME"
        unhealthy_count=0
        sleep 30  # Wait after restart
      fi
    fi
  else
    # Health check is configured
    if [ "$health_status" == "healthy" ]; then
      if [ $unhealthy_count -gt 0 ]; then
        echo "$(date): Container is healthy again"
        unhealthy_count=0
      fi
    elif [ "$health_status" == "unhealthy" ]; then
      unhealthy_count=$((unhealthy_count + 1))
      echo "$(date): Container is unhealthy - Status: $health_status - Count: $unhealthy_count/$MAX_UNHEALTHY_COUNT"
      
      if [ $unhealthy_count -ge $MAX_UNHEALTHY_COUNT ]; then
        echo "$(date): Container unhealthy for too long. Restarting..."
        docker restart "$CONTAINER_NAME"
        unhealthy_count=0
        sleep 30  # Wait after restart
      fi
    fi
  fi

  sleep $CHECK_INTERVAL
done

