export const MARK_SOURCE = {
  SELF: 'self',
  COMMITTEE: 'committee',
};

export const isSelfMark = (mark) => (mark?.markSource ?? MARK_SOURCE.SELF) === MARK_SOURCE.SELF;

export const isCommitteeMark = (mark) => mark?.markSource === MARK_SOURCE.COMMITTEE;
