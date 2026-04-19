# 📝 TodoList Microservice avec Kubernetes

## 🚀 Description

Ce projet est une application **TodoList full-stack** développée avec une architecture **microservices** et déployée sur **Kubernetes**.

Il permet de gérer des tâches (ajout, consultation, suppression) via une interface web moderne, connectée à une API backend et une base de données PostgreSQL.

L’objectif principal est de démontrer la mise en place d’une application conteneurisée, scalable et orchestrée avec Kubernetes.

---

## 🧱 Architecture

L’application est composée de :

* 🔹 **Frontend** : interface utilisateur moderne (React)
* 🔹 **Backend** : API REST en Node.js (Express)
* 🔹 **Base de données** : PostgreSQL
* 🔹 **Orchestration** : Kubernetes (Minikube)

---

## ⚙️ Technologies utilisées

* Node.js / Express
* React (Frontend)
* PostgreSQL
* Docker
* Kubernetes (Minikube)
* ConfigMap & Secrets (gestion de configuration)
* Persistent Volume (persistance des données)

---

## 📦 Fonctionnalités

* ✅ Ajouter une tâche
* 📋 Afficher toutes les tâches
* ❌ Supprimer une tâche
* 📊 Statistiques (total, restantes, terminées)
* 🌐 Interface utilisateur moderne et responsive

---

## 🐳 Conteneurisation

Chaque composant est conteneurisé avec Docker :

* Image backend (Node.js)
* Image frontend (React)
* Image PostgreSQL (officielle)

---

## ☸️ Déploiement Kubernetes

Les ressources Kubernetes incluent :

* Deployments (backend & database)
* Services (ClusterIP & NodePort)
* ConfigMap (configuration)
* Secret (données sensibles)
* PersistentVolumeClaim (stockage)

---

## 🔐 Gestion des configurations

* Variables sensibles → **Secrets (base64)**
* Variables non sensibles → **ConfigMap**

---

## ▶️ Lancer le projet

### 1. Cloner le projet

```bash
git clone https://github.com/sagesse12/todolist-k8s.git
cd todolist-k8s
```

### 2. Construire l’image Docker

```bash
docker build -t todolist-app ./app
```

### 3. Déployer sur Kubernetes

```bash
kubectl apply -f k8s/
```

### 4. Accéder à l’application

```bash
minikube service web-service
```

---

## 🧪 Tests

* Vérifier que les pods sont en cours d’exécution :

```bash
kubectl get pods
```

* Tester l’API :

```bash
curl http://<MINIKUBE_IP>:<NODE_PORT>
```

---

## 📁 Structure du projet

```
app/
 ├── backend (Node.js)
 ├── frontend (React)
k8s/
 ├── deployment-db.yaml
 ├── web-deployment.yaml
 ├── service-db.yaml
 ├── web-service.yaml
 ├── configmap.yaml
 ├── secret.yaml
 ├── pvc.yaml
```

---

## 🎯 Objectifs pédagogiques

* Comprendre Docker et la conteneurisation
* Déployer une application sur Kubernetes
* Gérer la communication entre services
* Utiliser ConfigMap et Secrets
* Implémenter la persistance des données

---

## 📌 Améliorations possibles

* 🔐 Authentification utilisateur
* 🌍 Déploiement cloud (AWS, Azure, GCP)
* 🔁 CI/CD (GitHub Actions)
* 🌐 Ingress Controller (URL personnalisée)

---

## 👨‍💻 Auteur

Projet réalisé dans le cadre d’un apprentissage de Kubernetes et des architectures microservices.

---

## ⭐ Contribution

Les contributions sont les bienvenues !
