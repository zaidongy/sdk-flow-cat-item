import { VariableSet, CatalogItemRecordProducer, RichTextLabelVariable } from '@servicenow/sdk/core'

// const catalogServiceCatalog = 'e0d08b13c3330100c8b837659bba8fb4';

// CatalogItem({
//     $id: Now.ID['basic_catalog_item'],
//     name: 'Basic Laptop Request',
//     shortDescription: 'Request a standard laptop for business use',
//     description: 'Use this form to request a standard laptop for business use. Approval from your manager is required.',
//     catalogs: [catalogServiceCatalog],
//     categories: [categoryHardware],
//     variableSets: [{ variableSet: userInfoVarSet, order: 100 }],
//     executionPlan: '523da512c611228900811a37c97c2014',
// })

// CatalogClientScript({
//     $id: Now.ID['new-laptop-client-script'],
//     name: 'Required By Date Validation',
//     script: `function onSubmit() {
//     var reqDate = g_form.getValue('required_by_date');
//     var today = new Date();
//     var selectedDate = new Date(reqDate);
//     var diffDays = (selectedDate - today) / (1000 * 60 * 60 * 24);
//     if (diffDays < 7) {
//         alert('Required By date must be at least 7 days from today.');
//         return false;
//     }
//     return true;
// }
// `,
//     type: 'onSubmit',
//     catalogItem: requestNewLaptop,
//     appliesOnRequestedItems: true,
//     appliesOnCatalogTasks: true,
//     appliesOnTargetRecord: true,
//     vaSupported: true,
// })

// VariableSet({
//     $id: 'contact_info_set',
//     title: 'Contact Information',
//     internalName: 'contact_information',
//     description: 'Standard contact information fields including phone, email, and address',
//     type: 'singleRow',
//     order: 100,
// })

// CatalogUiPolicy({
//   $id: Now.ID['employee_request_ui_policy_external_1'],
//   shortDescription: 'If urgent is true, require manager approval and show department',
// //   @fluent-ignore
//   catalogCondition: `${departmentVariableSet.variables.urgent} === true`,
//   variableSet: departmentVariableSet,
//   appliesTo: 'set',
//   actions: [
//     {
//       variableName: departmentVariableSet.variables.department,
//       order: 100,
//       mandatory: true,
//       visible: true,
//     }
//   ],
// });

const incidentDetailsVarSet = VariableSet({
    $id: 'contact_info_set',
    title: 'Contact Information',
    internalName: 'contact_information',
    description: 'Standard contact information fields including phone, email, and address',
    type: 'singleRow',
    order: 100,
    version: 2,
    variables: {
        label_1: RichTextLabelVariable({
            order: 100,
            richText: '<p><span style="font-size: 14pt;"><strong>Describe your incident in detail</strong></span></p>',
        }),
    },
})

CatalogItemRecordProducer({
    $id: Now.ID['basic_incident_producer'],
    name: 'Report an Incident from Fluent Scope',
    shortDescription: 'Create a new incident ticket',
    description: '<p>Use this form to report IT issues and incidents.</p>',
    table: 'incident',
    // catalogs: [catalogServiceCatalog],
    // categories: [categoryIncidents],
    variableSets: [{ variableSet: incidentDetailsVarSet, order: 100 }],
    hideSaveAsDraft: false,
    mandatoryAttachment: false,
    hideAttachment: true,
    // availableFor: [userCriteriaITStaff],
    notAvailableFor: ['66c1b50e730333009508738234f6a7c9'],
    version: 2,
})
