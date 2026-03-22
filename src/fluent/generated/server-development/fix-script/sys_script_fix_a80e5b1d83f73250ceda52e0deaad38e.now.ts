import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['a80e5b1d83f73250ceda52e0deaad38e'],
    table: 'sys_script_fix',
    data: {
        before: false,
        name: 'Demo Fix',
        record_for_rollback: true,
        script: '// Demo fix script - this script does not do anything but to test git sync between local, remote, and servicenow instances',
        unloadable: false,
    },
})
