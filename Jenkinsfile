pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = "szteunipress-ci"
  }

  options {
    skipDefaultCheckout(true)
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Client') {
      steps {
        dir('client/szteunipress') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Build Server') {
      steps {
        dir('server') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Docker Compose Build') {
      steps {
        sh 'docker compose build client server'
      }
    }

    stage('Deploy Stack') {
      steps {
        sh 'docker compose up -d mongo server client nginx'
      }
    }

    stage('Smoke Tests (non-blocking)') {
      steps {
        script {
          catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
            withEnv(['API_URL=http://server:3000', 'NGINX_URL=http://nginx:80']) {
              sh 'bash scripts/smoke.sh'
            }
          }
        }
      }
    }
  }

  post {
    always {
      sh 'docker compose ps'
    }
  }
}

