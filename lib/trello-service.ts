// Trello Service - Comprehensive API Integration
// Handles authentication, board management, card operations, and project management

interface TrelloUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  url: string;
  confirmed: boolean;
  memberType: string;
  status: string;
  products: number[];
  aaId: string;
  aaEmail: string;
  aaEnrolledDate: string;
  avatarSource: string;
  initials: string;
  nonPublic: {
    fullName: string;
    initials: string;
    avatarUrl: string;
  };
  nonPublicAvailable: boolean;
  prefs: {
    privacy: {
      fullName: string;
      avatar: string;
    };
    sendSummaries: boolean;
    minutesBetweenSummaries: number;
    minutesBeforeDeadlineToNotify: number;
    colorBlind: boolean;
    locale: string;
    timezoneInfo: {
      offsetCurrent: number;
      timezoneCurrent: string;
      offsetNext: number;
      dateNext: string;
      timezoneNext: string;
    };
  };
  trophies: string[];
  uploadedAvatarUrl: string;
  uploadedAvatarHash: string;
  goldSunshine: boolean;
  oneTimeMessagesDismissed: string[];
  limits: {
    boards: {
      totalPerMember: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
    orgs: {
      totalPerMember: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
  loginTypes: string[];
  marketingOptIn: {
    optedIn: boolean;
    date: string;
  };
  messagesDismissed: Array<{
    _id: string;
    last_seen: string;
    count: number;
  }>;
  activity: {
    idBoards: string[];
    idCards: string[];
    idOrgs: string[];
    idBoards_invited: string[];
    idBoards_WATCHING: string[];
    idCards_WATCHING: string[];
    idOrgs_invited: string[];
    idOrgs_WATCHING: string[];
  };
  boards: TrelloBoard[];
  cards: TrelloCard[];
  organizations: TrelloOrganization[];
}

interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  descData: any;
  closed: boolean;
  idMemberCreator: string;
  idOrganization: string;
  pinned: boolean;
  url: string;
  shortUrl: string;
  prefs: {
    permissionLevel: string;
    hideVotes: boolean;
    voting: string;
    comments: string;
    invitations: string;
    selfJoin: boolean;
    cardCovers: boolean;
    isTemplate: boolean;
    cardAging: string;
    calendarFeedEnabled: boolean;
    hiddenPluginBoardButtons: string[];
    switcherViews: Array<{
      viewType: string;
      enabled: boolean;
    }>;
    background: string;
    backgroundColor: string;
    backgroundImage: string;
    backgroundImageScaled: Array<{
      width: number;
      height: number;
      url: string;
    }>;
    backgroundTile: boolean;
    backgroundBrightness: string;
    backgroundBottomColor: string;
    backgroundTopColor: string;
    canBePublic: boolean;
    canBeEnterprise: boolean;
    canBeOrg: boolean;
    canBePrivate: boolean;
    canInvite: boolean;
  };
  labelNames: {
    green: string;
    yellow: string;
    orange: string;
    red: string;
    purple: string;
    blue: string;
    sky: string;
    lime: string;
    pink: string;
    black: string;
  };
  limits: {
    attachments: {
      perBoard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
      perCard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
    boards: {
      totalMembersPerBoard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
    cards: {
      openPerBoard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
      totalPerBoard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
    checklists: {
      perBoard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
      perCard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
    lists: {
      totalPerBoard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
  memberships: Array<{
    id: string;
    idMember: string;
    memberType: string;
    unconfirmed: boolean;
    deactivated: boolean;
  }>;
  shortLink: string;
  subscribed: boolean;
  powerUps: string[];
  dateLastActivity: string;
  dateLastView: string;
  datePluginDisable: string;
  creationMethod: string;
  ixUpdate: string;
  templateGallery: string;
  enterpriseOwned: boolean;
  idBoardSource: string;
  premiumFeatures: string[];
  idTags: string[];
  members: TrelloMember[];
  lists: TrelloList[];
  cards: TrelloCard[];
  labels: TrelloLabel[];
  actions: TrelloAction[];
  checklists: TrelloChecklist[];
  pluginData: TrelloPluginData[];
  customFields: TrelloCustomField[];
}

interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  subscribed: boolean;
  softLimit: number;
  limits: {
    cards: {
      openPerList: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
      totalPerList: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
  creationMethod: string;
  cards: TrelloCard[];
}

interface TrelloCard {
  id: string;
  address: string;
  badges: {
    attachmentsByType: {
      trello: {
        board: number;
        card: number;
      };
    };
    location: boolean;
    votes: number;
    viewingMemberVoted: boolean;
    subscribed: boolean;
    fogbugz: string;
    checkItems: number;
    checkItemsChecked: number;
    checkItemsEarliestDue: string;
    comments: number;
    attachments: number;
    description: boolean;
    due: string;
    dueComplete: boolean;
    start: string;
  };
  checkItemStates: any[];
  closed: boolean;
  coordinates: string;
  creationMethod: string;
  dateLastActivity: string;
  desc: string;
  descData: any;
  due: string;
  dueComplete: boolean;
  dueReminder: number;
  email: string;
  idBoard: string;
  idChecklists: string[];
  idLabels: string[];
  idList: string;
  idMembers: string[];
  idMembersVoted: string[];
  idShort: number;
  idAttachmentCover: string;
  labels: TrelloLabel[];
  limits: {
    attachments: {
      perCard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
    checklists: {
      perCard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
    stickers: {
      perCard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
  locationName: string;
  manualCoverAttachment: boolean;
  name: string;
  pos: number;
  shortLink: string;
  shortUrl: string;
  start: string;
  subscribed: boolean;
  url: string;
  cover: {
    idAttachment: string;
    color: string;
    idUploadedBackground: string;
    size: string;
    brightness: string;
    idPlugin: string;
  };
  isTemplate: boolean;
  cardRole: string;
  attachments: TrelloAttachment[];
  checklists: TrelloChecklist[];
  members: TrelloMember[];
  actions: TrelloAction[];
  customFieldItems: TrelloCustomFieldItem[];
  pluginData: TrelloPluginData[];
  stickers: TrelloSticker[];
}

interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
  initials: string;
  avatarUrl: string;
  avatarHash: string;
  status: string;
  confirmed: boolean;
  memberType: string;
  deactivated: boolean;
  activityBlocked: boolean;
  nonPublic: {
    fullName: string;
    initials: string;
    avatarUrl: string;
  };
  nonPublicAvailable: boolean;
}

interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: string;
  uses: number;
}

interface TrelloAction {
  id: string;
  idMemberCreator: string;
  data: any;
  appCreator: any;
  type: string;
  date: string;
  limits: {
    reactions: {
      perAction: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
      uniquePerAction: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
  display: {
    translationKey: string;
    entities: any;
  };
  memberCreator: TrelloMember;
  reactions: TrelloReaction[];
}

interface TrelloReaction {
  id: string;
  idMember: string;
  idModel: string;
  idEmoji: string;
  member: TrelloMember;
  emoji: TrelloEmoji;
}

interface TrelloEmoji {
  trelloId: string;
  name: string;
  native: string;
  unified: string;
  skin: any;
  shortNames: string[];
}

interface TrelloChecklist {
  id: string;
  name: string;
  idBoard: string;
  idCard: string;
  pos: number;
  checkItems: TrelloCheckItem[];
  limits: {
    checkItems: {
      perChecklist: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
  creationMethod: string;
}

interface TrelloCheckItem {
  id: string;
  name: string;
  nameData: any;
  pos: number;
  state: string;
  due: string;
  dueReminder: number;
  idMember: string;
  idChecklist: string;
  member: TrelloMember;
}

interface TrelloAttachment {
  id: string;
  bytes: number;
  date: string;
  edgeColor: string;
  idMember: string;
  isUpload: boolean;
  mimeType: string;
  name: string;
  pos: number;
  previews: Array<{
    _id: string;
    bytes: number;
    height: number;
    scaled: boolean;
    url: string;
    width: number;
  }>;
  url: string;
  fileName: string;
}

interface TrelloCustomField {
  id: string;
  idModel: string;
  modelType: string;
  fieldGroup: string;
  display: {
    cardFront: boolean;
  };
  name: string;
  pos: number;
  options: Array<{
    id: string;
    idCustomField: string;
    value: {
      text: string;
    };
    color: string;
    pos: number;
  }>;
  type: string;
}

interface TrelloCustomFieldItem {
  id: string;
  value: any;
  idCustomField: string;
  idModel: string;
  modelType: string;
  fieldGroup: string;
}

interface TrelloOrganization {
  id: string;
  name: string;
  displayName: string;
  desc: string;
  descData: any;
  url: string;
  website: string;
  logoHash: string;
  logoUrl: string;
  premiumFeatures: string[];
  billableMemberCount: number;
  activeBillableMemberCount: number;
  memberships: Array<{
    id: string;
    idMember: string;
    memberType: string;
    unconfirmed: boolean;
    deactivated: boolean;
  }>;
  powerUps: string[];
  products: number[];
  limits: {
    orgs: {
      freeBoardsPerOrg: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
      totalMembersPerOrg: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
  boards: TrelloBoard[];
  members: TrelloMember[];
}

interface TrelloPluginData {
  id: string;
  idPlugin: string;
  scope: string;
  idModel: string;
  value: string;
  access: string;
}

interface TrelloSticker {
  id: string;
  top: number;
  left: number;
  zIndex: number;
  rotate: number;
  image: string;
  imageUrl: string;
  imageScaled: Array<{
    id: string;
    scaled: boolean;
    url: string;
    bytes: number;
    height: number;
    width: number;
  }>;
}

interface CreateCardRequest {
  name: string;
  desc?: string;
  pos?: string | number;
  due?: string;
  start?: string;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
  urlSource?: string;
  fileSource?: string;
  mimeType?: string;
  idCardSource?: string;
  keepFromSource?: string;
  address?: string;
  locationName?: string;
  coordinates?: string;
}

interface UpdateCardRequest {
  name?: string;
  desc?: string;
  closed?: boolean;
  idMembers?: string[];
  idAttachmentCover?: string;
  idList?: string;
  idLabels?: string[];
  idBoard?: string;
  pos?: string | number;
  due?: string;
  start?: string;
  dueComplete?: boolean;
  subscribed?: boolean;
  address?: string;
  locationName?: string;
  coordinates?: string;
  cover?: {
    color?: string;
    brightness?: string;
    url?: string;
    idAttachment?: string;
    size?: string;
  };
}

export class TrelloService {
  private readonly baseUrl = 'https://api.trello.com/1';
  private readonly apiKey: string;
  private readonly token: string;

  constructor(apiKey: string, token: string) {
    this.apiKey = apiKey;
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('key', this.apiKey);
    url.searchParams.append('token', this.token);

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trello API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private buildQueryParams(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    return queryParams.toString();
  }

  // User Management
  async getCurrentUser(): Promise<TrelloUser> {
    return this.makeRequest<TrelloUser>('/members/me');
  }

  async getUser(userId: string): Promise<TrelloUser> {
    return this.makeRequest<TrelloUser>(`/members/${userId}`);
  }

  // Board Management
  async getUserBoards(filter: string = 'open'): Promise<TrelloBoard[]> {
    return this.makeRequest<TrelloBoard[]>(`/members/me/boards?filter=${filter}`);
  }

  async getBoard(boardId: string, options: {
    actions?: string;
    boardStars?: string;
    cards?: string;
    card_pluginData?: boolean;
    checklists?: string;
    customFields?: boolean;
    fields?: string;
    labels?: string;
    lists?: string;
    members?: string;
    memberships?: string;
    pluginData?: boolean;
    organization?: boolean;
    organization_pluginData?: boolean;
    myPrefs?: boolean;
    tags?: boolean;
  } = {}): Promise<TrelloBoard> {
    const queryParams = this.buildQueryParams(options);
    return this.makeRequest<TrelloBoard>(`/boards/${boardId}?${queryParams}`);
  }

  async createBoard(boardData: {
    name: string;
    desc?: string;
    idOrganization?: string;
    prefs_permissionLevel?: string;
    prefs_voting?: string;
    prefs_comments?: string;
    prefs_invitations?: string;
    prefs_selfJoin?: boolean;
    prefs_cardCovers?: boolean;
    prefs_background?: string;
    prefs_cardAging?: string;
    powerUps?: string;
    defaultLabels?: boolean;
    defaultLists?: boolean;
    keepFromSource?: string;
    prefs_calendarFeedEnabled?: boolean;
  }): Promise<TrelloBoard> {
    const formData = new FormData();
    Object.entries(boardData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.makeRequest<TrelloBoard>('/boards', {
      method: 'POST',
      body: formData,
    });
  }

  async updateBoard(boardId: string, updateData: {
    name?: string;
    desc?: string;
    closed?: boolean;
    subscribed?: boolean;
    idOrganization?: string;
    prefs_permissionLevel?: string;
    prefs_selfJoin?: boolean;
    prefs_cardCovers?: boolean;
    prefs_hideVotes?: boolean;
    prefs_invitations?: string;
    prefs_voting?: string;
    prefs_comments?: string;
    prefs_background?: string;
    prefs_cardAging?: string;
    prefs_calendarFeedEnabled?: boolean;
    labelNames_green?: string;
    labelNames_yellow?: string;
    labelNames_orange?: string;
    labelNames_red?: string;
    labelNames_purple?: string;
    labelNames_blue?: string;
    labelNames_sky?: string;
    labelNames_lime?: string;
    labelNames_pink?: string;
    labelNames_black?: string;
  }): Promise<TrelloBoard> {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.makeRequest<TrelloBoard>(`/boards/${boardId}`, {
      method: 'PUT',
      body: formData,
    });
  }

  // List Management
  async getBoardLists(boardId: string, filter: string = 'open'): Promise<TrelloList[]> {
    return this.makeRequest<TrelloList[]>(`/boards/${boardId}/lists?filter=${filter}`);
  }

  async getList(listId: string, options: {
    cards?: string;
    card_fields?: string;
    board?: boolean;
    board_fields?: string;
    fields?: string;
  } = {}): Promise<TrelloList> {
    const queryParams = this.buildQueryParams(options);
    return this.makeRequest<TrelloList>(`/lists/${listId}?${queryParams}`);
  }

  async createList(listData: {
    name: string;
    idBoard: string;
    idListSource?: string;
    pos?: string | number;
  }): Promise<TrelloList> {
    const formData = new FormData();
    Object.entries(listData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.makeRequest<TrelloList>('/lists', {
      method: 'POST',
      body: formData,
    });
  }

  async updateList(listId: string, updateData: {
    name?: string;
    closed?: boolean;
    idBoard?: string;
    pos?: string | number;
    subscribed?: boolean;
  }): Promise<TrelloList> {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.makeRequest<TrelloList>(`/lists/${listId}`, {
      method: 'PUT',
      body: formData,
    });
  }

  // Card Management
  async getListCards(listId: string, filter: string = 'open'): Promise<TrelloCard[]> {
    return this.makeRequest<TrelloCard[]>(`/lists/${listId}/cards?filter=${filter}`);
  }

  async getCard(cardId: string, options: {
    actions?: string;
    actions_entities?: boolean;
    actions_display?: boolean;
    actions_format?: string;
    actions_since?: string;
    actions_before?: string;
    action_fields?: string;
    action_memberCreator?: boolean;
    action_memberCreator_fields?: string;
    action_member?: boolean;
    action_member_fields?: string;
    attachments?: boolean | string;
    attachment_fields?: string;
    members?: boolean;
    member_fields?: string;
    membersVoted?: boolean;
    memberVoted_fields?: string;
    checkItemStates?: boolean;
    checkItemStates_fields?: string;
    checklists?: string;
    checklist_fields?: string;
    board?: boolean;
    board_fields?: string;
    list?: boolean;
    list_fields?: string;
    pluginData?: boolean;
    stickers?: boolean;
    sticker_fields?: string;
    customFieldItems?: boolean;
    fields?: string;
  } = {}): Promise<TrelloCard> {
    const queryParams = this.buildQueryParams(options);
    return this.makeRequest<TrelloCard>(`/cards/${cardId}?${queryParams}`);
  }

  async createCard(listId: string, cardData: CreateCardRequest): Promise<TrelloCard> {
    const formData = new FormData();
    formData.append('idList', listId);
    
    Object.entries(cardData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.makeRequest<TrelloCard>('/cards', {
      method: 'POST',
      body: formData,
    });
  }

  async updateCard(cardId: string, updateData: UpdateCardRequest): Promise<TrelloCard> {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, value.join(','));
                 } else if (typeof value === 'object' && value !== null) {
           // Handle nested objects like cover
           Object.entries(value).forEach(([subKey, subValue]) => {
             if (subValue !== undefined && subValue !== null) {
               formData.append(`${key}/${subKey}`, subValue.toString());
             }
           });
         } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.makeRequest<TrelloCard>(`/cards/${cardId}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.makeRequest(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // Member Management
  async addMembersToCard(cardId: string, memberIds: string[]): Promise<TrelloCard> {
    return this.updateCard(cardId, { idMembers: memberIds });
  }

  async removeMemberFromCard(cardId: string, memberId: string): Promise<TrelloCard> {
    await this.makeRequest(`/cards/${cardId}/idMembers/${memberId}`, {
      method: 'DELETE',
    });
    return this.getCard(cardId);
  }

  // Label Management
  async getBoardLabels(boardId: string): Promise<TrelloLabel[]> {
    return this.makeRequest<TrelloLabel[]>(`/boards/${boardId}/labels`);
  }

  async createLabel(boardId: string, labelData: {
    name: string;
    color: string;
  }): Promise<TrelloLabel> {
    const formData = new FormData();
    formData.append('name', labelData.name);
    formData.append('color', labelData.color);

    return this.makeRequest<TrelloLabel>(`/boards/${boardId}/labels`, {
      method: 'POST',
      body: formData,
    });
  }

  async addLabelsToCard(cardId: string, labelIds: string[]): Promise<TrelloCard> {
    return this.updateCard(cardId, { idLabels: labelIds });
  }

  async removeLabelFromCard(cardId: string, labelId: string): Promise<TrelloCard> {
    await this.makeRequest(`/cards/${cardId}/idLabels/${labelId}`, {
      method: 'DELETE',
    });
    return this.getCard(cardId);
  }

  // Checklist Management
  async getCardChecklists(cardId: string): Promise<TrelloChecklist[]> {
    return this.makeRequest<TrelloChecklist[]>(`/cards/${cardId}/checklists`);
  }

  async createChecklist(cardId: string, checklistData: {
    name: string;
    idChecklistSource?: string;
    pos?: string | number;
  }): Promise<TrelloChecklist> {
    const formData = new FormData();
    Object.entries(checklistData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.makeRequest<TrelloChecklist>(`/cards/${cardId}/checklists`, {
      method: 'POST',
      body: formData,
    });
  }

  async addChecklistItem(checklistId: string, itemData: {
    name: string;
    pos?: string | number;
    checked?: boolean;
    due?: string;
    dueReminder?: number;
    idMember?: string;
  }): Promise<TrelloCheckItem> {
    const formData = new FormData();
    Object.entries(itemData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.makeRequest<TrelloCheckItem>(`/checklists/${checklistId}/checkItems`, {
      method: 'POST',
      body: formData,
    });
  }

  async updateChecklistItem(cardId: string, checklistId: string, itemId: string, updateData: {
    name?: string;
    state?: string;
    pos?: string | number;
    due?: string;
    dueReminder?: number;
    idMember?: string;
  }): Promise<TrelloCheckItem> {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.makeRequest<TrelloCheckItem>(`/cards/${cardId}/checklist/${checklistId}/checkItem/${itemId}`, {
      method: 'PUT',
      body: formData,
    });
  }

  // Due Date Management
  async setCardDueDate(cardId: string, dueDate: string | Date): Promise<TrelloCard> {
    const dateString = dueDate instanceof Date ? dueDate.toISOString() : dueDate;
    return this.updateCard(cardId, { due: dateString });
  }

  async markCardDueComplete(cardId: string, complete: boolean = true): Promise<TrelloCard> {
    return this.updateCard(cardId, { dueComplete: complete });
  }

  // Attachment Management
  async getCardAttachments(cardId: string): Promise<TrelloAttachment[]> {
    return this.makeRequest<TrelloAttachment[]>(`/cards/${cardId}/attachments`);
  }

  async addAttachmentToCard(cardId: string, attachmentData: {
    name?: string;
    file?: File;
    url?: string;
    mimeType?: string;
    setCover?: boolean;
  }): Promise<TrelloAttachment> {
    const formData = new FormData();
    Object.entries(attachmentData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'file' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.makeRequest<TrelloAttachment>(`/cards/${cardId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  }

  // Comment Management
  async getCardComments(cardId: string): Promise<TrelloAction[]> {
    return this.makeRequest<TrelloAction[]>(`/cards/${cardId}/actions?filter=commentCard`);
  }

  async addCommentToCard(cardId: string, comment: string): Promise<TrelloAction> {
    const formData = new FormData();
    formData.append('text', comment);

    return this.makeRequest<TrelloAction>(`/cards/${cardId}/actions/comments`, {
      method: 'POST',
      body: formData,
    });
  }

  // Utility methods for SDLC integration
  async addChecklistToCard(cardId: string, checklistName: string, items: string[] = []): Promise<TrelloChecklist> {
    const checklist = await this.createChecklist(cardId, { name: checklistName });
    
    for (const item of items) {
      await this.addChecklistItem(checklist.id, { name: item });
    }
    
    return checklist;
  }

  async createSDLCCard(listId: string, sdlcData: {
    title: string;
    description: string;
    assignees?: string[];
    labels?: string[];
    dueDate?: Date;
    checklist?: {
      name: string;
      items: string[];
    };
    attachments?: Array<{
      name: string;
      url: string;
    }>;
  }): Promise<{
    card: TrelloCard;
    checklist?: TrelloChecklist;
    attachments?: TrelloAttachment[];
  }> {
    const cardData: CreateCardRequest = {
      name: sdlcData.title,
      desc: sdlcData.description,
      idMembers: sdlcData.assignees,
      idLabels: sdlcData.labels,
      due: sdlcData.dueDate?.toISOString(),
    };

    const card = await this.createCard(listId, cardData);
    let checklist: TrelloChecklist | undefined;
    let attachments: TrelloAttachment[] = [];

    if (sdlcData.checklist) {
      checklist = await this.addChecklistToCard(card.id, sdlcData.checklist.name, sdlcData.checklist.items);
    }

    if (sdlcData.attachments) {
      for (const attachment of sdlcData.attachments) {
        const trelloAttachment = await this.addAttachmentToCard(card.id, {
          name: attachment.name,
          url: attachment.url,
        });
        attachments.push(trelloAttachment);
      }
    }

    return { card, checklist, attachments };
  }

  async moveCardToList(cardId: string, listId: string, position?: string | number): Promise<TrelloCard> {
    return this.updateCard(cardId, { 
      idList: listId,
      pos: position
    });
  }

  async archiveCard(cardId: string): Promise<TrelloCard> {
    return this.updateCard(cardId, { closed: true });
  }

  async unarchiveCard(cardId: string): Promise<TrelloCard> {
    return this.updateCard(cardId, { closed: false });
  }

  // Helper method to validate API credentials
  async validateCredentials(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // =====================================================
  // SDLC PROJECT CREATION AND MANAGEMENT
  // =====================================================

  /**
   * Create a complete Trello project structure from SDLC document
   * Maps: boards → projects, lists → phases, cards → tasks
   */
  async createSDLCProject(sdlcDocument: any, options: {
    projectName: string;
    organizationId?: string;
    teamMembers?: string[];
    projectLabels?: Array<{ name: string; color: string }>;
    dueDate?: Date;
    includeTemplates?: boolean;
    autoAssignment?: boolean;
  }): Promise<{
    board: TrelloBoard;
    lists: TrelloList[];
    cards: TrelloCard[];
    labels: TrelloLabel[];
    summary: {
      totalLists: number;
      totalCards: number;
      totalLabels: number;
      estimatedEffort: string;
      projectTimeline: string;
    };
  }> {
    try {
      console.log('🚀 Creating Trello SDLC Project:', options.projectName);

      // Step 1: Create the main project board
      const board = await this.createBoard({
        name: options.projectName,
        desc: this.generateProjectDescription(sdlcDocument),
        idOrganization: options.organizationId,
        prefs_permissionLevel: 'org',
        prefs_voting: 'members',
        prefs_comments: 'members',
        prefs_invitations: 'members',
        prefs_selfJoin: true,
        prefs_cardCovers: true,
        defaultLabels: true,
        defaultLists: false, // We'll create custom lists
      });

      console.log('✅ Created board:', board.id);

      // Step 2: Create project labels for categorization
      const labels = await this.createProjectLabels(board.id, options.projectLabels);
      console.log('✅ Created labels:', labels.length);

      // Step 3: Create SDLC phase lists
      const lists = await this.createSDLCLists(board.id, sdlcDocument);
      console.log('✅ Created lists:', lists.length);

      // Step 4: Create cards for each feature/task
      const cards = await this.createSDLCCards(lists, sdlcDocument, {
        teamMembers: options.teamMembers,
        labels: labels,
        dueDate: options.dueDate,
        autoAssignment: options.autoAssignment,
      });
      console.log('✅ Created cards:', cards.length);

      // Step 5: Generate project summary
      const summary = this.generateProjectSummary(lists, cards, labels, sdlcDocument);

      return {
        board,
        lists,
        cards,
        labels,
        summary,
      };
    } catch (error) {
      console.error('❌ Error creating SDLC project:', error);
      throw new Error(`Failed to create SDLC project: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive project description from SDLC document
   */
  private generateProjectDescription(sdlcDocument: any): string {
    const sections = [];
    
    if (sdlcDocument.project_overview) {
      sections.push(`**Project Overview**\n${sdlcDocument.project_overview.description || ''}`);
    }

    if (sdlcDocument.business_requirements?.objectives) {
      sections.push(`**Objectives**\n${sdlcDocument.business_requirements.objectives.map((obj: any) => `• ${obj}`).join('\n')}`);
    }

    if (sdlcDocument.technical_architecture?.technology_stack) {
      const stack = sdlcDocument.technical_architecture.technology_stack;
      sections.push(`**Technology Stack**\n• Frontend: ${stack.frontend?.join(', ') || 'TBD'}\n• Backend: ${stack.backend?.join(', ') || 'TBD'}\n• Database: ${stack.database?.join(', ') || 'TBD'}`);
    }

    sections.push('---\n*Generated from SDLC document via AI automation*');
    
    return sections.join('\n\n');
  }

  /**
   * Create standardized project labels for categorization
   */
  private async createProjectLabels(boardId: string, customLabels?: Array<{ name: string; color: string }>): Promise<TrelloLabel[]> {
    const standardLabels = [
      { name: 'Epic', color: 'purple' },
      { name: 'Feature', color: 'blue' },
      { name: 'Bug', color: 'red' },
      { name: 'Enhancement', color: 'green' },
      { name: 'Documentation', color: 'yellow' },
      { name: 'Testing', color: 'orange' },
      { name: 'High Priority', color: 'red' },
      { name: 'Medium Priority', color: 'yellow' },
      { name: 'Low Priority', color: 'green' },
      { name: 'Blocked', color: 'black' },
    ];

    const labelsToCreate = customLabels || standardLabels;
    const createdLabels: TrelloLabel[] = [];

    for (const labelData of labelsToCreate) {
      try {
        const label = await this.createLabel(boardId, labelData);
        createdLabels.push(label);
      } catch (error) {
        console.warn(`⚠️ Could not create label ${labelData.name}:`, error);
      }
    }

    return createdLabels;
  }

  /**
   * Create SDLC phase lists based on document structure
   */
  private async createSDLCLists(boardId: string, sdlcDocument: any): Promise<TrelloList[]> {
    const phases = [
      { name: '📋 Planning & Analysis', description: 'Project planning and requirements analysis' },
      { name: '🎨 Design & Architecture', description: 'System design and technical architecture' },
      { name: '⚡ Development - Sprint 1', description: 'Core feature development' },
      { name: '⚡ Development - Sprint 2', description: 'Additional feature development' },
      { name: '🧪 Testing & QA', description: 'Quality assurance and testing' },
      { name: '🚀 Deployment & Release', description: 'Production deployment and release' },
      { name: '📈 Monitoring & Maintenance', description: 'Post-release monitoring and maintenance' },
      { name: '✅ Completed', description: 'Completed tasks' },
    ];

    const createdLists: TrelloList[] = [];
    let position = 1;

    for (const phase of phases) {
      try {
        const list = await this.createList({
          name: phase.name,
          idBoard: boardId,
          pos: position,
        });
        createdLists.push(list);
        position++;
      } catch (error) {
        console.warn(`⚠️ Could not create list ${phase.name}:`, error);
      }
    }

    return createdLists;
  }

  /**
   * Create cards for features, epics, and tasks from SDLC document
   */
  private async createSDLCCards(
    lists: TrelloList[],
    sdlcDocument: any,
    options: {
      teamMembers?: string[];
      labels: TrelloLabel[];
      dueDate?: Date;
      autoAssignment?: boolean;
    }
  ): Promise<TrelloCard[]> {
    const createdCards: TrelloCard[] = [];

    // Map lists by name for easy access
    const listMap = lists.reduce((acc, list) => {
      acc[list.name.toLowerCase()] = list;
      return acc;
    }, {} as Record<string, TrelloList>);

    // Create Epic cards from major features
    if (sdlcDocument.detailed_features) {
      for (const [index, feature] of sdlcDocument.detailed_features.entries()) {
        const epicCard = await this.createSDLCCard(
          listMap['📋 planning & analysis']?.id || lists[0].id,
          {
            title: `Epic: ${feature.name || `Feature ${index + 1}`}`,
            description: this.formatFeatureDescription(feature),
            assignees: options.autoAssignment ? this.assignTeamMembers(options.teamMembers, index) : [],
            labels: this.getCardLabels(['Epic', 'High Priority'], options.labels),
            dueDate: options.dueDate,
            checklist: {
              name: 'Epic Requirements',
              items: this.extractFeatureRequirements(feature),
            },
          }
        );
        createdCards.push(epicCard.card);
      }
    }

    // Create Feature cards from technical requirements
    if (sdlcDocument.technical_requirements?.functional_requirements) {
      for (const [index, requirement] of sdlcDocument.technical_requirements.functional_requirements.entries()) {
        const featureCard = await this.createSDLCCard(
          listMap['🎨 design & architecture']?.id || lists[1].id,
          {
            title: `Feature: ${requirement.title || `Requirement ${index + 1}`}`,
            description: requirement.description || '',
            assignees: options.autoAssignment ? this.assignTeamMembers(options.teamMembers, index) : [],
            labels: this.getCardLabels(['Feature', 'Medium Priority'], options.labels),
            checklist: {
              name: 'Acceptance Criteria',
              items: requirement.acceptance_criteria || [],
            },
          }
        );
        createdCards.push(featureCard.card);
      }
    }

    // Create Development Task cards
    const developmentTasks = this.generateDevelopmentTasks(sdlcDocument);
    for (const [index, task] of developmentTasks.entries()) {
      const listId = index % 2 === 0 ? 
        listMap['⚡ development - sprint 1']?.id : 
        listMap['⚡ development - sprint 2']?.id;
      
      const taskCard = await this.createSDLCCard(
        listId || lists[2].id,
        {
          title: task.title,
          description: task.description,
          assignees: options.autoAssignment ? this.assignTeamMembers(options.teamMembers, index) : [],
          labels: this.getCardLabels([task.priority, task.type], options.labels),
          checklist: {
            name: 'Development Tasks',
            items: task.subtasks,
          },
        }
      );
      createdCards.push(taskCard.card);
    }

    // Create Testing cards
    const testingTasks = this.generateTestingTasks(sdlcDocument);
    for (const [index, task] of testingTasks.entries()) {
      const testCard = await this.createSDLCCard(
        listMap['🧪 testing & qa']?.id || lists[4].id,
        {
          title: task.title,
          description: task.description,
          assignees: options.autoAssignment ? this.assignTeamMembers(options.teamMembers, index) : [],
          labels: this.getCardLabels(['Testing', 'Medium Priority'], options.labels),
          checklist: {
            name: 'Test Cases',
            items: task.testCases,
          },
        }
      );
      createdCards.push(testCard.card);
    }

    return createdCards;
  }

  /**
   * Format feature description for card
   */
  private formatFeatureDescription(feature: any): string {
    const sections = [];
    
    if (feature.description) {
      sections.push(`**Description**\n${feature.description}`);
    }

    if (feature.business_value) {
      sections.push(`**Business Value**\n${feature.business_value}`);
    }

    if (feature.technical_considerations) {
      sections.push(`**Technical Considerations**\n${feature.technical_considerations}`);
    }

    if (feature.dependencies && feature.dependencies.length > 0) {
      sections.push(`**Dependencies**\n${feature.dependencies.map((dep: string) => `• ${dep}`).join('\n')}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Extract requirements from feature for checklist
   */
  private extractFeatureRequirements(feature: any): string[] {
    const requirements = [];

    if (feature.acceptance_criteria) {
      requirements.push(...feature.acceptance_criteria);
    }

    if (feature.user_stories) {
      requirements.push(...feature.user_stories.map((story: any) => 
        typeof story === 'string' ? story : story.story || story.title
      ));
    }

    // Add default requirements if none exist
    if (requirements.length === 0) {
      requirements.push(
        'Define detailed requirements',
        'Create technical specification',
        'Review and approve design',
        'Identify dependencies'
      );
    }

    return requirements;
  }

  /**
   * Get card labels by name
   */
  private getCardLabels(labelNames: string[], availableLabels: TrelloLabel[]): string[] {
    return availableLabels
      .filter(label => labelNames.some(name => 
        label.name.toLowerCase().includes(name.toLowerCase())
      ))
      .map(label => label.id);
  }

  /**
   * Assign team members in round-robin fashion
   */
  private assignTeamMembers(teamMembers?: string[], index: number = 0): string[] {
    if (!teamMembers || teamMembers.length === 0) {
      return [];
    }
    return [teamMembers[index % teamMembers.length]];
  }

  /**
   * Generate development tasks from SDLC document
   */
  private generateDevelopmentTasks(sdlcDocument: any): Array<{
    title: string;
    description: string;
    priority: string;
    type: string;
    subtasks: string[];
  }> {
    const tasks = [];

    // Database tasks
    if (sdlcDocument.database_design?.tables) {
      tasks.push({
        title: 'Database Schema Implementation',
        description: 'Implement database schema with all required tables and relationships',
        priority: 'High Priority',
        type: 'Feature',
        subtasks: [
          'Create database migration scripts',
          'Implement table relationships',
          'Add indexes and constraints',
          'Test database operations',
        ],
      });
    }

    // API tasks
    if (sdlcDocument.api_specifications?.endpoints) {
      tasks.push({
        title: 'REST API Development',
        description: 'Implement all API endpoints with proper authentication and validation',
        priority: 'High Priority',
        type: 'Feature',
        subtasks: [
          'Implement authentication middleware',
          'Create CRUD endpoints',
          'Add input validation',
          'Write API documentation',
        ],
      });
    }

    // Frontend tasks
    if (sdlcDocument.user_interface?.pages) {
      tasks.push({
        title: 'Frontend UI Implementation',
        description: 'Implement user interface components and pages',
        priority: 'Medium Priority',
        type: 'Feature',
        subtasks: [
          'Create reusable components',
          'Implement page layouts',
          'Add responsive design',
          'Integrate with API',
        ],
      });
    }

    // Authentication tasks
    if (sdlcDocument.security_framework?.authentication) {
      tasks.push({
        title: 'Authentication System',
        description: 'Implement secure user authentication and authorization',
        priority: 'High Priority',
        type: 'Feature',
        subtasks: [
          'Implement login/logout',
          'Add password hashing',
          'Create JWT tokens',
          'Add role-based access',
        ],
      });
    }

    // Add default tasks if none exist
    if (tasks.length === 0) {
      tasks.push(
        {
          title: 'Core Feature Development',
          description: 'Implement main application features',
          priority: 'High Priority',
          type: 'Feature',
          subtasks: ['Design architecture', 'Implement core logic', 'Add error handling', 'Write unit tests'],
        },
        {
          title: 'Integration Development',
          description: 'Implement external service integrations',
          priority: 'Medium Priority',
          type: 'Feature',
          subtasks: ['Configure API clients', 'Handle authentication', 'Add retry logic', 'Test integrations'],
        }
      );
    }

    return tasks;
  }

  /**
   * Generate testing tasks from SDLC document
   */
  private generateTestingTasks(sdlcDocument: any): Array<{
    title: string;
    description: string;
    testCases: string[];
  }> {
    const tasks = [];

    tasks.push({
      title: 'Unit Testing',
      description: 'Comprehensive unit tests for all components',
      testCases: [
        'Test all service methods',
        'Test component rendering',
        'Test error handling',
        'Test edge cases',
        'Achieve 80%+ code coverage',
      ],
    });

    tasks.push({
      title: 'Integration Testing',
      description: 'End-to-end integration testing',
      testCases: [
        'Test API endpoints',
        'Test database operations',
        'Test external integrations',
        'Test authentication flows',
        'Test user workflows',
      ],
    });

    tasks.push({
      title: 'Performance Testing',
      description: 'Load and performance testing',
      testCases: [
        'Test response times',
        'Test concurrent users',
        'Test database performance',
        'Test memory usage',
        'Test scalability',
      ],
    });

    return tasks;
  }

  /**
   * Generate project summary
   */
  private generateProjectSummary(
    lists: TrelloList[],
    cards: TrelloCard[],
    labels: TrelloLabel[],
    sdlcDocument: any
  ) {
    const estimatedDays = cards.length * 2; // Rough estimate: 2 days per card
    const estimatedWeeks = Math.ceil(estimatedDays / 5);

    return {
      totalLists: lists.length,
      totalCards: cards.length,
      totalLabels: labels.length,
      estimatedEffort: `${estimatedDays} days (${estimatedWeeks} weeks)`,
      projectTimeline: `${estimatedWeeks}-${estimatedWeeks + 2} weeks`,
    };
  }

  /**
   * Export project data for reporting
   */
  async exportProject(boardId: string): Promise<{
    board: TrelloBoard;
    export: {
      lists: Array<{
        name: string;
        cardCount: number;
        cards: Array<{
          name: string;
          description: string;
          labels: string[];
          members: string[];
          checklists: number;
          completed: boolean;
        }>;
      }>;
      summary: {
        totalCards: number;
        completedCards: number;
        progress: string;
      };
    };
  }> {
    const board = await this.getBoard(boardId, {
      lists: 'open',
      cards: 'open',
      members: 'all',
      labels: 'all',
      checklists: 'all',
    });

    const exportData = {
      lists: board.lists.map(list => ({
        name: list.name,
        cardCount: list.cards?.length || 0,
        cards: (list.cards || []).map(card => ({
          name: card.name,
          description: card.desc,
          labels: card.labels?.map(label => label.name) || [],
          members: card.members?.map(member => member.fullName) || [],
          checklists: card.checklists?.length || 0,
          completed: card.closed,
        })),
      })),
      summary: {
        totalCards: board.cards?.length || 0,
        completedCards: board.cards?.filter(card => card.closed).length || 0,
        progress: board.cards?.length ? 
          `${Math.round(((board.cards.filter(card => card.closed).length / board.cards.length) * 100))}%` : 
          '0%',
      },
    };

    return { board, export: exportData };
  }

  /**
   * Bulk operations for project management
   */
  async bulkCreateCards(listId: string, cardData: Array<{
    name: string;
    desc?: string;
    labels?: string[];
    members?: string[];
    dueDate?: Date;
    checklist?: { name: string; items: string[] };
  }>): Promise<TrelloCard[]> {
    const createdCards: TrelloCard[] = [];

    for (const data of cardData) {
      try {
        const card = await this.createSDLCCard(listId, {
          title: data.name,
          description: data.desc,
          assignees: data.members,
          labels: data.labels,
          dueDate: data.dueDate,
          checklist: data.checklist,
        });
        createdCards.push(card.card);
      } catch (error) {
        console.warn(`⚠️ Failed to create card ${data.name}:`, error);
      }
    }

    return createdCards;
  }

  /**
   * Move cards between lists (workflow management)
   */
  async moveCardsToNextPhase(fromListId: string, toListId: string, cardIds?: string[]): Promise<TrelloCard[]> {
    const fromList = await this.getList(fromListId, { cards: 'open' });
    const cardsToMove = cardIds ? 
      fromList.cards.filter(card => cardIds.includes(card.id)) : 
      fromList.cards;

    const movedCards: TrelloCard[] = [];

    for (const card of cardsToMove) {
      try {
        const movedCard = await this.moveCardToList(card.id, toListId);
        movedCards.push(movedCard);
      } catch (error) {
        console.warn(`⚠️ Failed to move card ${card.name}:`, error);
      }
    }

    return movedCards;
  }
}