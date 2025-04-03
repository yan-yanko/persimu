/**
 * מערכת ויזואליזציה של זיכרונות
 */

class MemoryVisualization {
    constructor(config = {}) {
        this.episodicMemory = config.episodicMemory;
        this.semanticMemory = config.semanticMemory;
        this.container = config.container;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.memoryNodes = new Map();
        this.relationshipLines = [];
    }

    /**
     * אתחול המערכת
     */
    init() {
        // הגדרת רינדורר
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // הגדרת מצלמה
        this.camera.position.z = 5;

        // הגדרת תאורה
        const light = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(light);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        this.scene.add(directionalLight);

        // טעינת זיכרונות
        this.loadMemories();

        // התחלת אנימציה
        this.animate();
    }

    /**
     * טעינת זיכרונות
     */
    loadMemories() {
        // טעינת זיכרונות אפיזודיים
        const episodicMemories = Array.from(this.episodicMemory.memories.values());
        this.createTimelineView(episodicMemories);

        // טעינת ידע סמנטי
        const semanticKnowledge = Array.from(this.semanticMemory.knowledge.values());
        this.createKnowledgeGraph(semanticKnowledge);
    }

    /**
     * יצירת תצוגת ציר זמן
     */
    createTimelineView(memories) {
        const timeline = new THREE.Group();
        const spacing = 0.5;
        let currentX = 0;

        memories.forEach((memory, index) => {
            const node = this.createMemoryNode(memory, currentX, 0, 0);
            timeline.add(node);
            currentX += spacing;
        });

        this.scene.add(timeline);
    }

    /**
     * יצירת צומת זיכרון
     */
    createMemoryNode(memory, x, y, z) {
        const geometry = new THREE.SphereGeometry(0.2, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: this.getMemoryColor(memory),
            emissive: this.getMemoryEmissive(memory)
        });
        const node = new THREE.Mesh(geometry, material);
        node.position.set(x, y, z);

        // שמירת מידע על הזיכרון
        node.userData = {
            type: 'memory',
            id: memory.id,
            data: memory
        };

        this.memoryNodes.set(memory.id, node);
        return node;
    }

    /**
     * יצירת גרף ידע
     */
    createKnowledgeGraph(knowledge) {
        const graph = new THREE.Group();
        const radius = 3;
        const angleStep = (2 * Math.PI) / knowledge.length;

        knowledge.forEach((item, index) => {
            const angle = index * angleStep;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const node = this.createKnowledgeNode(item, x, y, 0);
            graph.add(node);
        });

        this.scene.add(graph);
    }

    /**
     * יצירת צומת ידע
     */
    createKnowledgeNode(knowledge, x, y, z) {
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const material = new THREE.MeshPhongMaterial({
            color: this.getKnowledgeColor(knowledge),
            emissive: this.getKnowledgeEmissive(knowledge)
        });
        const node = new THREE.Mesh(geometry, material);
        node.position.set(x, y, z);

        // שמירת מידע על הידע
        node.userData = {
            type: 'knowledge',
            id: knowledge.id,
            data: knowledge
        };

        this.memoryNodes.set(knowledge.id, node);
        return node;
    }

    /**
     * ציור קווים בין זיכרונות קשורים
     */
    drawRelationships() {
        // מחיקת קווים קיימים
        this.relationshipLines.forEach(line => this.scene.remove(line));
        this.relationshipLines = [];

        // ציור קווים חדשים
        this.episodicMemory.memories.forEach(memory => {
            memory.relatedMemories.forEach(relatedId => {
                const sourceNode = this.memoryNodes.get(memory.id);
                const targetNode = this.memoryNodes.get(relatedId);
                if (sourceNode && targetNode) {
                    const line = this.createRelationshipLine(sourceNode, targetNode);
                    this.relationshipLines.push(line);
                    this.scene.add(line);
                }
            });
        });
    }

    /**
     * יצירת קו קשר
     */
    createRelationshipLine(source, target) {
        const points = [];
        points.push(source.position);
        points.push(target.position);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x808080 });
        return new THREE.Line(geometry, material);
    }

    /**
     * קבלת צבע לזיכרון
     */
    getMemoryColor(memory) {
        switch (memory.type) {
            case 'conversation': return 0x3498db;
            case 'action': return 0x2ecc71;
            case 'observation': return 0xe74c3c;
            case 'summary': return 0xf1c40f;
            default: return 0x95a5a6;
        }
    }

    /**
     * קבלת צבע זוהר לזיכרון
     */
    getMemoryEmissive(memory) {
        return memory.importance > 7 ? 0x333333 : 0x000000;
    }

    /**
     * קבלת צבע לידע
     */
    getKnowledgeColor(knowledge) {
        switch (knowledge.type) {
            case 'fact': return 0x3498db;
            case 'belief': return 0x9b59b6;
            case 'rule': return 0xe67e22;
            default: return 0x95a5a6;
        }
    }

    /**
     * קבלת צבע זוהר לידע
     */
    getKnowledgeEmissive(knowledge) {
        return knowledge.certainty > 80 ? 0x333333 : 0x000000;
    }

    /**
     * אנימציה
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * טיפול בשינוי גודל חלון
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * טיפול באירועי עכבר
     */
    onMouseClick(event) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.type) {
                this.showMemoryDetails(object.userData.data);
            }
        }
    }

    /**
     * הצגת פרטי זיכרון
     */
    showMemoryDetails(data) {
        // כאן ייושם קוד להצגת פרטי הזיכרון בממשק המשתמש
        console.log('Memory details:', data);
    }

    /**
     * חיפוש וסינון זיכרונות
     */
    filterMemories(query) {
        const filteredNodes = Array.from(this.memoryNodes.values())
            .filter(node => {
                if (node.userData.type === 'memory') {
                    return this.matchesQuery(node.userData.data, query);
                }
                return false;
            });

        // הסתרת כל הצמתים
        this.memoryNodes.forEach(node => {
            node.visible = false;
        });

        // הצגת צמתים מסוננים
        filteredNodes.forEach(node => {
            node.visible = true;
        });

        // עדכון קווים
        this.drawRelationships();
    }

    /**
     * בדיקת התאמה לחיפוש
     */
    matchesQuery(data, query) {
        const searchableText = [
            data.type,
            data.context,
            data.content,
            ...data.participants,
            ...data.emotions
        ].join(' ').toLowerCase();

        return searchableText.includes(query.toLowerCase());
    }
}

module.exports = MemoryVisualization; 