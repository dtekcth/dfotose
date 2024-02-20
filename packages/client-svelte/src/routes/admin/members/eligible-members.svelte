<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { createEligibleUser, deleteEligibleUser, type EligibleUser } from '$lib/api/user';

	export let members: EligibleUser[];

	let cid: string;
	let role: string = 'Admin';

	async function addEligibleUser() {
		await createEligibleUser({ fetch }, { cid, role });
		cid = '';
		role = 'None';
		await invalidate('app:eligibleUsers');
	}

	async function removeEligibleUser(user: EligibleUser) {
		await deleteEligibleUser({ fetch }, user);
		await invalidate('app:eligibleUsers');
	}
</script>

<div>
	<form on:submit={addEligibleUser}>
		<input type="text" bind:value={cid} />
		<select bind:value={role}>
			<option value="Admin">Admin</option>
			<option value="DFoto">DFoto</option>
			<option value="Aspirant">Aspjävel</option>
			<option value="None">-</option>
		</select>
		<button>Lägg till</button>
	</form>

	<table>
		<thead>
			<tr>
				<th>cid</th>
				<th>roll</th>
				<th> </th>
			</tr>
		</thead>
		<tbody>
			{#each members as member (member.cid)}
				<tr>
					<td>{member.cid}</td>
					<td>{member.role}</td>
					<td>
						<button on:click={() => removeEligibleUser(member)}> Ta bort </button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
