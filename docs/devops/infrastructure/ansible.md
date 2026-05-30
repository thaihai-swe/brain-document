# Ansible

Ansible is an automation tool for configuration management, application deployment, and task automation.

## Overview

Ansible uses YAML playbooks to define automation tasks without requiring agents on managed nodes.

## Inventory

```ini
# inventory.ini
[webservers]
web1.example.com
web2.example.com

[databases]
db1.example.com
```

## Basic Playbook

```yaml
# playbook.yml
---
- name: Configure web servers
  hosts: webservers
  become: yes
  
  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present
        update_cache: yes
    
    - name: Start nginx
      service:
        name: nginx
        state: started
        enabled: yes
    
    - name: Copy config file
      copy:
        src: nginx.conf
        dest: /etc/nginx/nginx.conf
      notify: Restart nginx
  
  handlers:
    - name: Restart nginx
      service:
        name: nginx
        state: restarted
```

## Common Commands

```bash
# Run playbook
ansible-playbook -i inventory.ini playbook.yml

# Check syntax
ansible-playbook --syntax-check playbook.yml

# Dry run
ansible-playbook --check playbook.yml

# Ad-hoc command
ansible webservers -i inventory.ini -m ping
```

## Best Practices

- Use roles for organization
- Keep playbooks idempotent
- Use variables and templates
- Version control everything
- Test in staging first
- Use vault for secrets
