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
}