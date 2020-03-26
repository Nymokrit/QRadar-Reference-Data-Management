## Application Information
Short Description: Application to visualize Rule/CEP/Log Source Type Dependencies and manage them
Long Description: The application enables the user to visualize dependencies between Rules, Log Source Types and Custom Event Properties in a dependency graph and in a table view. This visualization should enable a user to more efficiently tune QRadar and spot inefficiencies. Additionally to the dependency visualization, with the App, the user can perform basic rule editing operations (i.e. Create Rules, Edit Rules, Delete Rules) and manage Reference Data more easily.

Key Use Cases are:
- Visualize which CEPs are defined for which Log Source Types
- Visualize which CEPs are used in which Rules and Building Blocks
- Visualize Rule Dependencies (Log Source Types, CEPs and other Rules)
- Visually navigate through dependencies by utilizing a Graph View
- Quickly navigate through all Rules/Building Blocks and view Rule Details
- Create/Edit/Delete Rules
- Quickly search for Events/Flows, that fired a specific rule 
- Quickly search for Events, that contain a specific CEP for a certain Log Source Type
- Visualize Contents of Reference Data (Sets, Maps, Map of Sets, Tables) without having to utilize the API directly
- Create new Reference Data (Sets, Maps, MoS, Tables)
- Import/Export Data to/from Reference Sets/Maps
- Add/Delete Data to/from Reference Sets/Maps/MoS/Tables

Support Information: Support is provided via EMail at michael.essigke1@ibm.com
Internet Access required: No
Cryptography used: No

## Application Metadata
Content-Type: QRadar Application
Tag Words: Dependency Management, Tuning

## Application Documentation

```
QRadar.rest({
            httpMethod: "GET",
            path: "/api/gui_app_framework/named_services",
            onComplete: function() {
                let services = JSON.parse(this.responseText);
                let service = QRadar.getNamedService(services, 'reference_data_service', 1);
                let endpoint = QRadar.getNamedServiceEndpoint(service, 'data');
                restArgs = QRadar.buildNamedServiceEndpointRestArgs({}, endpoint, {'type':'sets','name':'early_warning'});
                window.openWindow(restArgs.path)
            }
 })
 ```