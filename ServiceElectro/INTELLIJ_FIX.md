# 🔧 Solution : Erreur "Could not find or load main class"

## Problème
IntelliJ IDEA ne trouve pas la classe principale `ServiceElectroApplication`.

## ✅ Solutions (essayez dans l'ordre)

### Solution 1 : Rebuild Project (Le plus simple)

1. Dans IntelliJ IDEA, allez dans le menu :
   - **Build** → **Rebuild Project**
   
2. Attendez que la compilation soit terminée

3. Essayez de relancer l'application

---

### Solution 2 : Invalider le cache et redémarrer

1. Dans IntelliJ IDEA :
   - **File** → **Invalidate Caches...**
   
2. Cochez toutes les options :
   - ☑ Clear file system cache and Local History
   - ☑ Clear downloaded shared indexes
   - ☑ Clear VCS Log caches and indexes

3. Cliquez sur **Invalidate and Restart**

4. Après le redémarrage, refaites **Build** → **Rebuild Project**

---

### Solution 3 : Vérifier la configuration Maven

1. Ouvrez **File** → **Settings** (ou `Ctrl+Alt+S`)

2. Allez dans **Build, Execution, Deployment** → **Build Tools** → **Maven**

3. Vérifiez que :
   - **Maven home directory** est correctement configuré
   - **User settings file** pointe vers votre `settings.xml`

4. Cliquez sur **Apply** puis **OK**

5. Cliquez droit sur le fichier `pom.xml` dans le projet
   - **Maven** → **Reload Project**

---

### Solution 4 : Réimporter le projet Maven

1. Ouvrez la fenêtre **Maven** (View → Tool Windows → Maven)

2. Cliquez sur l'icône **Reload All Maven Projects** (🔄)

3. Ou cliquez droit sur le projet → **Maven** → **Reload Project**

---

### Solution 5 : Corriger la configuration de Run

1. Ouvrez **Run** → **Edit Configurations...**

2. Si vous voyez une configuration pour `ServiceElectroApplication`, sélectionnez-la et :
   - Vérifiez que **Main class** est bien : `org.example.serviceelectro.ServiceElectroApplication`
   - Vérifiez que **Module** est bien : `ServiceElectro`
   - Vérifiez que **Use classpath of module** est bien : `ServiceElectro`

3. Si la configuration n'existe pas ou est incorrecte :
   - Cliquez sur **+** → **Application**
   - **Name** : `ServiceElectroApplication`
   - **Main class** : `org.example.serviceelectro.ServiceElectroApplication`
   - **Module** : `ServiceElectro`
   - Cliquez sur **Apply** puis **OK**

---

### Solution 6 : Utiliser Maven pour lancer (Recommandé)

Au lieu d'utiliser la configuration IntelliJ, lancez directement avec Maven :

1. Ouvrez le terminal dans IntelliJ (View → Tool Windows → Terminal)

2. Exécutez :
   ```bash
   mvn clean spring-boot:run
   ```

Cette méthode contourne complètement la configuration IntelliJ et utilise directement Maven.

---

### Solution 7 : Vérifier la structure du projet

1. **File** → **Project Structure** (`Ctrl+Alt+Shift+S`)

2. Allez dans **Modules**

3. Vérifiez que :
   - Le module `ServiceElectro` existe
   - Les **Sources** pointent vers `src/main/java`
   - Les **Resources** pointent vers `src/main/resources`
   - Les **Test Sources** pointent vers `src/test/java`

4. Allez dans **Project**
   - Vérifiez que **Project SDK** est bien **Java 21**
   - **Project language level** est **21**

---

## 🚀 Après avoir appliqué les solutions

Une fois que l'application démarre, testez dans Postman avec ce JSON :

**POST** `http://localhost:9090/api/pub`
```json
{
  "title": "Réparation iPhone 12",
  "description": "Réparation écran cassé",
  "type": "REPARATION",
  "price": 150.0,
  "utilisateurId": 1
}
```

**Note :** Le champ `status` n'est plus requis - il sera automatiquement défini à `"DISPONIBLE"`.

---

## 📝 Solution la plus rapide

**Essayez d'abord cette séquence rapide :**

1. **Build** → **Rebuild Project**
2. Si ça ne marche pas, utilisez le terminal :
   ```bash
   mvn clean spring-boot:run
   ```

Cela devrait résoudre le problème dans 90% des cas !

