function getNotificationRecipients(event: any): string[] {
    const recipients = new Set<string>();

    // 1. Event creator
    if (event.creator?.creatorId) {
        recipients.add(event.creator.creatorId.toString());
    }

    // 2. Joined volunteers not complete
    event.joinedVolunteer?.forEach((vol: any) => {
        if (vol.workStatus !== 'complete') {
            recipients.add(vol.volunteer.toString());
        }
    });

    // 3. Invited volunteers not complete and not already joined
    const joinedIds = new Set(
        (event.joinedVolunteer || []).map((vol: any) => vol.volunteer.toString())
    );

    event.invitedVolunteer?.forEach((vol: any) => {
        const id = vol.volunteer?.toString();
        if (vol.workStatus !== 'complete' && id && !joinedIds.has(id)) {
            recipients.add(id);
        }
    });

    return [...recipients];
}

export default getNotificationRecipients;