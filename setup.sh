#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Clear screen
clear

# Print header
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}           TAT API Services Setup           ${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

# Print section header
print_section() {
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}--------------------------------------------${NC}"
}

# Get user input for required parameters
get_parameter() {
    local param_name=$1
    local param_desc=$2
    local param_value=""
    
    while [ -z "$param_value" ]; do
        echo -e "${YELLOW}Enter $param_desc:${NC}"
        read param_value
        if [ -z "$param_value" ]; then
            echo -e "${RED}Error: $param_desc is required${NC}"
        fi
    done
    echo "$param_value"
}

# Main menu
show_main_menu() {
    print_header
    echo "Select a category:"
    echo ""
    echo "1) Installation"
    echo "2) Module Generation"
    echo "3) Database Migrations"
    echo "4) Docker Build"
    echo "5) Docker Run"
    echo "6) Docker Compose"
    echo "7) Docker Utilities"
    echo "8) Docker Testing"
    echo "9) Docker Migrations"
    echo "0) Exit"
    echo ""
    echo -e "${GREEN}Enter your choice [0-9]:${NC}"
}

# Installation menu
installation_menu() {
    print_section "Installation"
    echo "1) Install all dependencies"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-1]:${NC}"
    
    read choice
    case $choice in
        1) make install ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Module Generation menu
module_generation_menu() {
    print_section "Module Generation"
    echo "1) Generate new module"
    echo "2) Generate module with auth"
    echo "3) Generate module with pagination"
    echo "4) Generate module with auth and pagination"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-4]:${NC}"
    
    read choice
    case $choice in
        1) 
            module_name=$(get_parameter "module_name" "module name")
            make generate name=$module_name
            ;;
        2)
            module_name=$(get_parameter "module_name" "module name")
            make generate-with-auth name=$module_name
            ;;
        3)
            module_name=$(get_parameter "module_name" "module name")
            make generate-with-pagination name=$module_name
            ;;
        4)
            module_name=$(get_parameter "module_name" "module name")
            make generate-full name=$module_name
            ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Database Migrations menu
migrations_menu() {
    print_section "Database Migrations"
    echo "1) Create new migration"
    echo "2) Generate migration from entity changes"
    echo "3) Run pending migrations"
    echo "4) Revert last migration"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-4]:${NC}"
    
    read choice
    case $choice in
        1)
            migration_name=$(get_parameter "migration_name" "migration name")
            make migration-create name=$migration_name
            ;;
        2)
            migration_name=$(get_parameter "migration_name" "migration name")
            make migration-generate name=$migration_name
            ;;
        3) make migration-run ;;
        4) make migration-revert ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Docker Build menu
docker_build_menu() {
    print_section "Docker Build"
    echo "1) Build development image"
    echo "2) Build staging image"
    echo "3) Build production image"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-3]:${NC}"
    
    read choice
    case $choice in
        1) make docker-dev-build ;;
        2) make docker-staging-build ;;
        3) make docker-prod-build ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Docker Run menu
docker_run_menu() {
    print_section "Docker Run"
    echo "1) Run development container"
    echo "2) Run staging container"
    echo "3) Run production container"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-3]:${NC}"
    
    read choice
    case $choice in
        1) make docker-dev-run ;;
        2) make docker-staging-run ;;
        3) make docker-prod-run ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Docker Compose menu
docker_compose_menu() {
    print_section "Docker Compose"
    echo "1) Start development environment"
    echo "2) Start staging environment"
    echo "3) Start production environment"
    echo "4) Stop development environment"
    echo "5) Stop staging environment"
    echo "6) Stop production environment"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-6]:${NC}"
    
    read choice
    case $choice in
        1) make docker-compose-dev ;;
        2) make docker-compose-staging ;;
        3) make docker-compose-prod ;;
        4) make docker-compose-down-dev ;;
        5) make docker-compose-down-staging ;;
        6) make docker-compose-down-prod ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Docker Utilities menu
docker_utilities_menu() {
    print_section "Docker Utilities"
    echo "1) View container logs"
    echo "2) List running containers"
    echo "3) Restart containers"
    echo "4) Clean Docker resources"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-4]:${NC}"
    
    read choice
    case $choice in
        1) make docker-logs ;;
        2) make docker-ps ;;
        3) make docker-restart ;;
        4) make docker-clean ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Docker Testing menu
docker_testing_menu() {
    print_section "Docker Testing"
    echo "1) Run tests"
    echo "2) Run e2e tests"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-2]:${NC}"
    
    read choice
    case $choice in
        1) make docker-test ;;
        2) make docker-test-e2e ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Docker Migrations menu
docker_migrations_menu() {
    print_section "Docker Migrations"
    echo "1) Run migrations"
    echo "2) Generate migration"
    echo "0) Back to main menu"
    echo ""
    echo -e "${GREEN}Enter your choice [0-2]:${NC}"
    
    read choice
    case $choice in
        1) make docker-migration-run ;;
        2)
            migration_name=$(get_parameter "migration_name" "migration name")
            make docker-migration-generate name=$migration_name
            ;;
        0) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Main loop
while true; do
    show_main_menu
    read choice
    
    case $choice in
        1) installation_menu ;;
        2) module_generation_menu ;;
        3) migrations_menu ;;
        4) docker_build_menu ;;
        5) docker_run_menu ;;
        6) docker_compose_menu ;;
        7) docker_utilities_menu ;;
        8) docker_testing_menu ;;
        9) docker_migrations_menu ;;
        0) 
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            sleep 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
    clear
done 