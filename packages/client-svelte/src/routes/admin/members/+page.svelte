<script lang="ts">
	import { updateUser, type User } from '$lib/api/user';
	import EligibleMembers from './eligible-members.svelte';

	export let data;

	let regularSearch = '';
	$: members = data.users.filter(
		(user) => regularSearch === '' || user.cid.includes(regularSearch)
	);

	async function setUserRole(user: User, role: string) {
		const newUser = {
			...user,
			role
		};

		await updateUser({ fetch }, newUser);
	}
</script>

<div>
	<p>
		Här kan du ge andra personer access till att ladda upp bilder - och i sin tur att ge andra
		personer access.
	</p>
	<h3>Fördefinierade roller</h3>
	<EligibleMembers members={data.eligibleUsers} />
	<h3>Medlemmar ({members.length} st)</h3>
	Sök:
	<input bind:value={regularSearch} name="search" type="search" />
	<table>
		<thead>
			<tr>
				<th> cid </th>
				<th> namn </th>
				<th> roll </th>
			</tr>
		</thead>
		<tbody>
			{#each members as member (member.cid)}
				<tr>
					<td>{member.cid}</td>
					<td>{member.fullname}</td>
					<td>
						<select
							value={member.role ?? 'None'}
							on:change={(e) => setUserRole(member, e.currentTarget.value)}
						>
							<option value="Admin">Admin</option>
							<option value="DFoto">DFoto</option>
							<option value="Aspirant">Aspjävel</option>
							<option value="None">-</option>
						</select>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
