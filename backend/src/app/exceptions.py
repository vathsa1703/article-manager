class EntityDuplicatedError(Exception):
    def __init__(
        self, action: str, user_id: int, entity_name: str, entity_id: int | str
    ):
        self.action = action
        self.user_id = user_id
        self.entity_name = entity_name
        self.entity_id = entity_id
        super().__init__(
            f"{action} failed — duplicate {entity_name.lower()}: {entity_id!r}"
        )
