import { Flow, wfa, trigger, action } from '@servicenow/sdk/automation'

Flow(
    {
        $id: Now.ID['cat_fact_incident_flow'],
        name: 'Cat Fact Incident Assignment Flow',
        description: 'Assigns incidents to random architect group member and adds a cat fact work note',
    },
    wfa.trigger(
        trigger.record.created,
        {
            $id: Now.ID['incident_created_trigger'],
        },
        {
            table: 'incident',
            run_on_extended: 'false',
            run_when_setting: 'both',
            run_flow_in: 'background',
            condition: '^EQ',
            run_when_user_setting: 'any',
            run_when_user_list: [],
        }
    ),
    (_params) => {
        wfa.action(
            action.core.log,
            {
                $id: Now.ID['log_flow_start'],
                annotation: 'Cat Fact Flow started for new incident',
            },
            {
                log_level: 'info',
                log_message: `Processing incident: ${wfa.dataPill(_params.trigger.current.number, 'string')}`,
            }
        )
        wfa.action(
            action.core.lookUpRecords,
            {
                $id: Now.ID['lookup_architect_members'],
                annotation: 'Get all members of the architect group',
            },
            {
                conditions: 'group=404cedd5930112003b4bb095e57ffbf4',
                table: 'sys_user_grmember',
                sort_type: 'sort_asc',
                sort_column: '',
                max_results: 100,
            }
        )
        wfa.action(
            action.core.updateRecord,
            {
                $id: Now.ID['update_incident_assignment'],
                annotation: 'Assign incident to architect group and random member',
            },
            {
                table_name: 'incident',
                record: wfa.dataPill(_params.trigger.current.sys_id, 'reference'),
                values: TemplateValue({
                    assignment_group:
                        '{"display":"Architects","value":"404cedd5930112003b4bb095e57ffbf4","sys_id":"404cedd5930112003b4bb095e57ffbf4"}',
                    assigned_to: 'fd-scripted',
                    work_notes: '🐱 Incident assigned to Architect group.',
                }),
            }
        )
        wfa.action(
            action.core.log,
            {
                $id: Now.ID['log_assignment'],
                annotation: 'Log the random assignment',
            },
            {
                log_level: 'info',
                log_message: wfa.inlineScript(
                    "'Assigned to architect group with ' + fd_data.lookup_architect_members.Count + ' members'"
                ),
            }
        )
        wfa.action(
            action.core.updateRecord,
            {
                $id: Now.ID['add_cat_fact_work_note'],
                annotation: 'Add cat fact as work note',
            },
            {
                table_name: 'incident',
                record: wfa.dataPill(_params.trigger.current.sys_id, 'reference'),
                values: TemplateValue({
                    work_notes: '🐱 Cat Fact: ',
                }),
            }
        )
        wfa.action(
            action.core.log,
            {
                $id: Now.ID['log_flow_complete'],
                annotation: 'Log flow completion with assignment details',
            },
            {
                log_level: 'info',
                log_message: wfa.inlineScript(`(function() {
                    var incidentId = fd_data.trigger.current.sys_id;
                    var incidentGR = new GlideRecord('incident');
                    if (incidentGR.get(incidentId)) {
                        var assignedTo = incidentGR.assigned_to.getDisplayValue() || 'Unassigned';
                        var assignmentGroup = incidentGR.assignment_group.getDisplayValue() || 'No Group';
                        return 'Cat Fact Flow completed. Assigned to: ' + assignedTo + ' in group: ' + assignmentGroup;
                    }
                    return 'Cat Fact Flow completed';
                })()`),
            }
        )
    }
)
