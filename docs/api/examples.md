# דוגמאות קוד

## JavaScript (Node.js)

### התקנה
```bash
npm install @persimu/market-research-api
```

### יצירת סימולציה חדשה
```javascript
const { MarketResearchAPI } = require('@persimu/market-research-api');

const api = new MarketResearchAPI({
    apiKey: 'your-api-key',
    environment: 'development'
});

async function createSimulation() {
    try {
        const simulation = await api.createSimulation({
            name: 'מחקר שוק למוצר חדש',
            product: {
                name: 'פרי-בר',
                description: 'חטיף פירות יבשים טבעי',
                price: 15.90,
                features: [
                    '100% טבעי',
                    'עשיר בחלבון צמחי',
                    'ללא סוכר'
                ]
            }
        });

        console.log('סימולציה נוצרה:', simulation.id);
        return simulation;
    } catch (error) {
        console.error('שגיאה ביצירת סימולציה:', error.message);
        throw error;
    }
}
```

### ניהול סוכנים
```javascript
async function manageAgents(simulationId) {
    try {
        // יצירת סוכן חדש
        const agent = await api.createAgent({
            simulationId,
            name: 'דנה כהן',
            demographics: {
                age: 28,
                gender: 'נקבה',
                income: 'גבוה'
            }
        });

        // קבלת רשימת סוכנים
        const agents = await api.getAgents({
            simulationId,
            page: 1,
            limit: 10
        });

        return agents;
    } catch (error) {
        console.error('שגיאה בניהול סוכנים:', error.message);
        throw error;
    }
}
```

### ניתוח תוצאות
```javascript
async function analyzeResults(simulationId) {
    try {
        // הרצת שיטת מחקר
        const research = await api.runResearchMethod({
            simulationId,
            method: 'focusGroup',
            parameters: {
                duration: 90,
                participants: 8
            }
        });

        // קבלת תוצאות
        const results = await api.getResearchResults({
            simulationId,
            method: 'focusGroup'
        });

        // קבלת ניתוח
        const analysis = await api.getResearchAnalysis(simulationId);

        return {
            research,
            results,
            analysis
        };
    } catch (error) {
        console.error('שגיאה בניתוח תוצאות:', error.message);
        throw error;
    }
}
```

## Python

### התקנה
```bash
pip install persimu-market-research
```

### יצירת סימולציה חדשה
```python
from persimu.market_research import MarketResearchAPI

api = MarketResearchAPI(
    api_key='your-api-key',
    environment='development'
)

def create_simulation():
    try:
        simulation = api.create_simulation({
            'name': 'מחקר שוק למוצר חדש',
            'product': {
                'name': 'פרי-בר',
                'description': 'חטיף פירות יבשים טבעי',
                'price': 15.90,
                'features': [
                    '100% טבעי',
                    'עשיר בחלבון צמחי',
                    'ללא סוכר'
                ]
            }
        })

        print(f'סימולציה נוצרה: {simulation.id}')
        return simulation
    except Exception as error:
        print(f'שגיאה ביצירת סימולציה: {str(error)}')
        raise
```

### ניהול סוכנים
```python
def manage_agents(simulation_id):
    try:
        # יצירת סוכן חדש
        agent = api.create_agent({
            'simulationId': simulation_id,
            'name': 'דנה כהן',
            'demographics': {
                'age': 28,
                'gender': 'נקבה',
                'income': 'גבוה'
            }
        })

        # קבלת רשימת סוכנים
        agents = api.get_agents({
            'simulationId': simulation_id,
            'page': 1,
            'limit': 10
        })

        return agents
    except Exception as error:
        print(f'שגיאה בניהול סוכנים: {str(error)}')
        raise
```

### ניתוח תוצאות
```python
def analyze_results(simulation_id):
    try:
        # הרצת שיטת מחקר
        research = api.run_research_method({
            'simulationId': simulation_id,
            'method': 'focusGroup',
            'parameters': {
                'duration': 90,
                'participants': 8
            }
        })

        # קבלת תוצאות
        results = api.get_research_results({
            'simulationId': simulation_id,
            'method': 'focusGroup'
        })

        # קבלת ניתוח
        analysis = api.get_research_analysis(simulation_id)

        return {
            'research': research,
            'results': results,
            'analysis': analysis
        }
    except Exception as error:
        print(f'שגיאה בניתוח תוצאות: {str(error)}')
        raise
```

## Java

### התקנה
```xml
<dependency>
    <groupId>com.persimu</groupId>
    <artifactId>market-research-api</artifactId>
    <version>1.0.0</version>
</dependency>
```

### יצירת סימולציה חדשה
```java
import com.persimu.marketresearch.MarketResearchAPI;
import com.persimu.marketresearch.models.Simulation;

public class SimulationExample {
    private final MarketResearchAPI api;

    public SimulationExample() {
        this.api = new MarketResearchAPI("your-api-key", "development");
    }

    public Simulation createSimulation() {
        try {
            Map<String, Object> product = new HashMap<>();
            product.put("name", "פרי-בר");
            product.put("description", "חטיף פירות יבשים טבעי");
            product.put("price", 15.90);
            product.put("features", Arrays.asList(
                "100% טבעי",
                "עשיר בחלבון צמחי",
                "ללא סוכר"
            ));

            Map<String, Object> data = new HashMap<>();
            data.put("name", "מחקר שוק למוצר חדש");
            data.put("product", product);

            Simulation simulation = api.createSimulation(data);
            System.out.println("סימולציה נוצרה: " + simulation.getId());
            return simulation;
        } catch (Exception e) {
            System.err.println("שגיאה ביצירת סימולציה: " + e.getMessage());
            throw e;
        }
    }
}
```

### ניהול סוכנים
```java
public class AgentExample {
    public List<Agent> manageAgents(String simulationId) {
        try {
            // יצירת סוכן חדש
            Map<String, Object> demographics = new HashMap<>();
            demographics.put("age", 28);
            demographics.put("gender", "נקבה");
            demographics.put("income", "גבוה");

            Map<String, Object> agentData = new HashMap<>();
            agentData.put("simulationId", simulationId);
            agentData.put("name", "דנה כהן");
            agentData.put("demographics", demographics);

            Agent agent = api.createAgent(agentData);

            // קבלת רשימת סוכנים
            Map<String, Object> params = new HashMap<>();
            params.put("simulationId", simulationId);
            params.put("page", 1);
            params.put("limit", 10);

            return api.getAgents(params);
        } catch (Exception e) {
            System.err.println("שגיאה בניהול סוכנים: " + e.getMessage());
            throw e;
        }
    }
}
```

### ניתוח תוצאות
```java
public class ResearchExample {
    public Map<String, Object> analyzeResults(String simulationId) {
        try {
            // הרצת שיטת מחקר
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("duration", 90);
            parameters.put("participants", 8);

            Map<String, Object> researchData = new HashMap<>();
            researchData.put("simulationId", simulationId);
            researchData.put("method", "focusGroup");
            researchData.put("parameters", parameters);

            Research research = api.runResearchMethod(researchData);

            // קבלת תוצאות
            Map<String, Object> resultsParams = new HashMap<>();
            resultsParams.put("simulationId", simulationId);
            resultsParams.put("method", "focusGroup");

            ResearchResults results = api.getResearchResults(resultsParams);

            // קבלת ניתוח
            ResearchAnalysis analysis = api.getResearchAnalysis(simulationId);

            Map<String, Object> response = new HashMap<>();
            response.put("research", research);
            response.put("results", results);
            response.put("analysis", analysis);

            return response;
        } catch (Exception e) {
            System.err.println("שגיאה בניתוח תוצאות: " + e.getMessage());
            throw e;
        }
    }
}
```

## C#

### התקנה
```xml
<PackageReference Include="Persimu.MarketResearch" Version="1.0.0" />
```

### יצירת סימולציה חדשה
```csharp
using Persimu.MarketResearch;

public class SimulationExample
{
    private readonly MarketResearchAPI _api;

    public SimulationExample()
    {
        _api = new MarketResearchAPI("your-api-key", "development");
    }

    public async Task<Simulation> CreateSimulationAsync()
    {
        try
        {
            var product = new Dictionary<string, object>
            {
                { "name", "פרי-בר" },
                { "description", "חטיף פירות יבשים טבעי" },
                { "price", 15.90 },
                { "features", new[] { "100% טבעי", "עשיר בחלבון צמחי", "ללא סוכר" } }
            };

            var data = new Dictionary<string, object>
            {
                { "name", "מחקר שוק למוצר חדש" },
                { "product", product }
            };

            var simulation = await _api.CreateSimulationAsync(data);
            Console.WriteLine($"סימולציה נוצרה: {simulation.Id}");
            return simulation;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"שגיאה ביצירת סימולציה: {ex.Message}");
            throw;
        }
    }
}
```

### ניהול סוכנים
```csharp
public class AgentExample
{
    public async Task<List<Agent>> ManageAgentsAsync(string simulationId)
    {
        try
        {
            // יצירת סוכן חדש
            var demographics = new Dictionary<string, object>
            {
                { "age", 28 },
                { "gender", "נקבה" },
                { "income", "גבוה" }
            };

            var agentData = new Dictionary<string, object>
            {
                { "simulationId", simulationId },
                { "name", "דנה כהן" },
                { "demographics", demographics }
            };

            var agent = await _api.CreateAgentAsync(agentData);

            // קבלת רשימת סוכנים
            var parameters = new Dictionary<string, object>
            {
                { "simulationId", simulationId },
                { "page", 1 },
                { "limit", 10 }
            };

            return await _api.GetAgentsAsync(parameters);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"שגיאה בניהול סוכנים: {ex.Message}");
            throw;
        }
    }
}
```

### ניתוח תוצאות
```csharp
public class ResearchExample
{
    public async Task<Dictionary<string, object>> AnalyzeResultsAsync(string simulationId)
    {
        try
        {
            // הרצת שיטת מחקר
            var parameters = new Dictionary<string, object>
            {
                { "duration", 90 },
                { "participants", 8 }
            };

            var researchData = new Dictionary<string, object>
            {
                { "simulationId", simulationId },
                { "method", "focusGroup" },
                { "parameters", parameters }
            };

            var research = await _api.RunResearchMethodAsync(researchData);

            // קבלת תוצאות
            var resultsParams = new Dictionary<string, object>
            {
                { "simulationId", simulationId },
                { "method", "focusGroup" }
            };

            var results = await _api.GetResearchResultsAsync(resultsParams);

            // קבלת ניתוח
            var analysis = await _api.GetResearchAnalysisAsync(simulationId);

            return new Dictionary<string, object>
            {
                { "research", research },
                { "results", results },
                { "analysis", analysis }
            };
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"שגיאה בניתוח תוצאות: {ex.Message}");
            throw;
        }
    }
}
```

## PHP

### התקנה
```bash
composer require persimu/market-research-api
```

### יצירת סימולציה חדשה
```php
<?php

use Persimu\MarketResearch\MarketResearchAPI;

class SimulationExample
{
    private $api;

    public function __construct()
    {
        $this->api = new MarketResearchAPI('your-api-key', 'development');
    }

    public function createSimulation()
    {
        try {
            $product = [
                'name' => 'פרי-בר',
                'description' => 'חטיף פירות יבשים טבעי',
                'price' => 15.90,
                'features' => [
                    '100% טבעי',
                    'עשיר בחלבון צמחי',
                    'ללא סוכר'
                ]
            ];

            $data = [
                'name' => 'מחקר שוק למוצר חדש',
                'product' => $product
            ];

            $simulation = $this->api->createSimulation($data);
            echo "סימולציה נוצרה: {$simulation->id}\n";
            return $simulation;
        } catch (Exception $e) {
            echo "שגיאה ביצירת סימולציה: {$e->getMessage()}\n";
            throw $e;
        }
    }
}
```

### ניהול סוכנים
```php
class AgentExample
{
    public function manageAgents($simulationId)
    {
        try {
            // יצירת סוכן חדש
            $demographics = [
                'age' => 28,
                'gender' => 'נקבה',
                'income' => 'גבוה'
            ];

            $agentData = [
                'simulationId' => $simulationId,
                'name' => 'דנה כהן',
                'demographics' => $demographics
            ];

            $agent = $this->api->createAgent($agentData);

            // קבלת רשימת סוכנים
            $parameters = [
                'simulationId' => $simulationId,
                'page' => 1,
                'limit' => 10
            ];

            return $this->api->getAgents($parameters);
        } catch (Exception $e) {
            echo "שגיאה בניהול סוכנים: {$e->getMessage()}\n";
            throw $e;
        }
    }
}
```

### ניתוח תוצאות
```php
class ResearchExample
{
    public function analyzeResults($simulationId)
    {
        try {
            // הרצת שיטת מחקר
            $parameters = [
                'duration' => 90,
                'participants' => 8
            ];

            $researchData = [
                'simulationId' => $simulationId,
                'method' => 'focusGroup',
                'parameters' => $parameters
            ];

            $research = $this->api->runResearchMethod($researchData);

            // קבלת תוצאות
            $resultsParams = [
                'simulationId' => $simulationId,
                'method' => 'focusGroup'
            ];

            $results = $this->api->getResearchResults($resultsParams);

            // קבלת ניתוח
            $analysis = $this->api->getResearchAnalysis($simulationId);

            return [
                'research' => $research,
                'results' => $results,
                'analysis' => $analysis
            ];
        } catch (Exception $e) {
            echo "שגיאה בניתוח תוצאות: {$e->getMessage()}\n";
            throw $e;
        }
    }
}
``` 