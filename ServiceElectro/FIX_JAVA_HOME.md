# 🔧 Solution : Erreur JAVA_HOME

## Problème
```
The JAVA_HOME environment variable is not defined correctly
```

## ✅ Solutions

### Solution 1 : Utiliser Maven directement (Plus simple)

Au lieu d'utiliser `./mvnw`, utilisez `mvn` directement :

```bash
mvn clean install
```

Ou pour lancer l'application :
```bash
mvn clean spring-boot:run
```

---

### Solution 2 : Définir JAVA_HOME temporairement

#### Dans Git Bash / Terminal Unix-like :

```bash
export JAVA_HOME="/c/Users/amine/.jdks/openjdk-21.0.1"
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw clean install
```

#### Dans CMD (Windows) :

```cmd
set JAVA_HOME=C:\Users\amine\.jdks\openjdk-21.0.1
set PATH=%JAVA_HOME%\bin;%PATH%
mvnw.cmd clean install
```

---

### Solution 3 : Définir JAVA_HOME de manière permanente

#### Windows (via Interface Graphique) :

1. Cliquez droit sur **Ce PC** → **Propriétés**
2. Cliquez sur **Paramètres système avancés**
3. Cliquez sur **Variables d'environnement**
4. Sous **Variables système**, cherchez ou créez `JAVA_HOME`
5. Définissez la valeur : `C:\Users\amine\.jdks\openjdk-21.0.1`
6. Dans la variable `Path`, ajoutez : `%JAVA_HOME%\bin`
7. Cliquez sur **OK** partout
8. **Redémarrez votre terminal/IntelliJ**

#### Windows (via PowerShell en tant qu'Administrateur) :

```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Users\amine\.jdks\openjdk-21.0.1", "User")
```

---

### Solution 4 : Utiliser directement Maven installé

Si vous avez Maven installé globalement, utilisez-le :

```bash
mvn clean install
```

Pour vérifier si Maven est installé :
```bash
mvn -version
```

---

## 🚀 Solution Recommandée (La plus rapide)

**Utilisez simplement `mvn` au lieu de `./mvnw` :**

```bash
mvn clean install
mvn spring-boot:run
```

Cela utilise le Maven installé sur votre système et devrait fonctionner directement !

