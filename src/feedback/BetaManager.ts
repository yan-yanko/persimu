import { BetaProgramConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Beta program participant model
 */
interface BetaParticipant {
    id: string;
    userId: string;
    email: string;
    name: string;
    programId: string;
    status: 'invited' | 'active' | 'inactive' | 'declined' | 'removed';
    joinDate?: Date;
    lastActivity?: Date;
    ndaAccepted: boolean;
    feedbackIds: string[];
    featureTesting: Record<string, {
        tested: boolean;
        feedbackProvided: boolean;
        lastTested?: Date;
    }>;
}

/**
 * Beta participant search filters
 */
interface BetaParticipantFilter {
    programId?: string;
    status?: BetaParticipant['status'][];
    ndaAccepted?: boolean;
    dateJoinedFrom?: Date;
    dateJoinedTo?: Date;
    lastActiveFrom?: Date;
    lastActiveTo?: Date;
    hasTested?: string; // Feature ID
    hasProvidedFeedback?: boolean;
}

/**
 * Interface for beta program data repository
 */
export interface BetaRepository {
    saveProgram(program: BetaProgramConfig): Promise<void>;
    getProgram(id: string): Promise<BetaProgramConfig | null>;
    getAllPrograms(status?: BetaProgramConfig['status']): Promise<BetaProgramConfig[]>;
    updateProgram(id: string, updates: Partial<BetaProgramConfig>): Promise<void>;
    
    saveParticipant(participant: BetaParticipant): Promise<void>;
    getParticipant(id: string): Promise<BetaParticipant | null>;
    getParticipantByUserId(userId: string, programId: string): Promise<BetaParticipant | null>;
    getAllParticipants(filters?: BetaParticipantFilter): Promise<BetaParticipant[]>;
    updateParticipant(id: string, updates: Partial<BetaParticipant>): Promise<void>;
}

/**
 * Beta program manager
 */
export class BetaManager {
    private repository: BetaRepository;

    constructor(repository: BetaRepository) {
        this.repository = repository;
    }

    /**
     * Create a new beta program
     */
    public async createBetaProgram(
        name: string,
        description: string,
        capacity: number,
        recruitmentStart: Date,
        recruitmentEnd: Date,
        programStart: Date,
        programEnd: Date,
        eligibilityCriteria: string[],
        ndaRequired: boolean = true
    ): Promise<string> {
        const program: BetaProgramConfig = {
            id: uuidv4(),
            name,
            description,
            capacity,
            status: 'planned',
            timeline: {
                recruitmentStart,
                recruitmentEnd,
                programStart,
                programEnd,
                milestones: []
            },
            eligibilityCriteria,
            features: [],
            communications: {
                welcomeMessage: `Welcome to the ${name} beta program!`,
                channels: ['email', 'in-app'],
                checkInFrequency: 7 // Default - weekly check-in
            },
            metrics: [
                'active_participation',
                'feedback_quality',
                'feature_usage',
                'bug_reports'
            ],
            nda: {
                required: ndaRequired
            }
        };

        await this.repository.saveProgram(program);
        return program.id;
    }

    /**
     * Add a milestone to the program
     */
    public async addMilestone(
        programId: string,
        date: Date,
        title: string,
        description: string
    ): Promise<void> {
        const program = await this.repository.getProgram(programId);
        if (!program) {
            throw new Error(`Beta program with ID ${programId} not found`);
        }

        program.timeline.milestones.push({ date, title, description });
        await this.repository.updateProgram(programId, { timeline: program.timeline });
    }

    /**
     * Add a feature to test in the beta program
     */
    public async addFeature(
        programId: string,
        name: string,
        description: string,
        testObjectives: string[]
    ): Promise<string> {
        const program = await this.repository.getProgram(programId);
        if (!program) {
            throw new Error(`Beta program with ID ${programId} not found`);
        }

        const featureId = uuidv4();
        const feature = {
            id: featureId,
            name,
            description,
            status: 'planned' as const,
            testObjectives
        };

        program.features.push(feature);
        await this.repository.updateProgram(programId, { features: program.features });
        return featureId;
    }

    /**
     * Update feature status
     */
    public async updateFeatureStatus(
        programId: string,
        featureId: string,
        status: 'planned' | 'available' | 'removed'
    ): Promise<void> {
        const program = await this.repository.getProgram(programId);
        if (!program) {
            throw new Error(`Beta program with ID ${programId} not found`);
        }

        const featureIndex = program.features.findIndex(f => f.id === featureId);
        if (featureIndex === -1) {
            throw new Error(`Feature with ID ${featureId} not found in program`);
        }

        program.features[featureIndex].status = status;
        await this.repository.updateProgram(programId, { features: program.features });
    }

    /**
     * Update beta program status
     */
    public async updateProgramStatus(
        programId: string,
        status: BetaProgramConfig['status']
    ): Promise<void> {
        await this.repository.updateProgram(programId, { status });
    }

    /**
     * Invite user to beta program
     */
    public async inviteParticipant(
        programId: string,
        userId: string,
        email: string,
        name: string
    ): Promise<string> {
        const program = await this.repository.getProgram(programId);
        if (!program) {
            throw new Error(`Beta program with ID ${programId} not found`);
        }

        // Check if user is already invited
        const existingParticipant = await this.repository.getParticipantByUserId(userId, programId);
        if (existingParticipant) {
            return existingParticipant.id;
        }

        // Check if there's room in the program
        const currentParticipants = await this.repository.getAllParticipants({ programId });
        if (currentParticipants.length >= program.capacity) {
            throw new Error(`Beta program ${program.name} has reached maximum participants`);
        }

        const participant: BetaParticipant = {
            id: uuidv4(),
            userId,
            email,
            name,
            programId,
            status: 'invited',
            ndaAccepted: false,
            feedbackIds: [],
            featureTesting: {}
        };

        // Initialize testing status for all features
        program.features.forEach(feature => {
            participant.featureTesting[feature.id] = {
                tested: false,
                feedbackProvided: false
            };
        });

        await this.repository.saveParticipant(participant);
        return participant.id;
    }

    /**
     * Accept invitation to beta program
     */
    public async acceptInvitation(
        participantId: string,
        ndaAccepted: boolean = true
    ): Promise<void> {
        const participant = await this.repository.getParticipant(participantId);
        if (!participant) {
            throw new Error(`Participant with ID ${participantId} not found`);
        }

        const program = await this.repository.getProgram(participant.programId);
        if (!program) {
            throw new Error(`Beta program with ID ${participant.programId} not found`);
        }

        // Check if NDA is required
        if (program.nda.required && !ndaAccepted) {
            throw new Error(`NDA acceptance is required to join the program`);
        }

        await this.repository.updateParticipant(participantId, {
            status: 'active',
            joinDate: new Date(),
            lastActivity: new Date(),
            ndaAccepted
        });
    }

    /**
     * Decline invitation to beta program
     */
    public async declineInvitation(participantId: string): Promise<void> {
        await this.repository.updateParticipant(participantId, {
            status: 'declined'
        });
    }

    /**
     * Record participant activity
     */
    public async recordParticipantActivity(
        participantId: string,
        featureId?: string
    ): Promise<void> {
        const participant = await this.repository.getParticipant(participantId);
        if (!participant || participant.status !== 'active') {
            return;
        }

        const updates: Partial<BetaParticipant> = {
            lastActivity: new Date()
        };

        // If feature ID is provided, update activity for this feature
        if (featureId && participant.featureTesting[featureId]) {
            const featureTesting = { ...participant.featureTesting };
            featureTesting[featureId] = {
                ...featureTesting[featureId],
                tested: true,
                lastTested: new Date()
            };
            updates.featureTesting = featureTesting;
        }

        await this.repository.updateParticipant(participantId, updates);
    }

    /**
     * Record feedback from beta program
     */
    public async recordFeedback(
        participantId: string,
        feedbackId: string,
        featureId?: string
    ): Promise<void> {
        const participant = await this.repository.getParticipant(participantId);
        if (!participant || participant.status !== 'active') {
            return;
        }

        const updates: Partial<BetaParticipant> = {
            feedbackIds: [...participant.feedbackIds, feedbackId],
            lastActivity: new Date()
        };

        // If feature ID is provided, update feedback for this feature
        if (featureId && participant.featureTesting[featureId]) {
            const featureTesting = { ...participant.featureTesting };
            featureTesting[featureId] = {
                ...featureTesting[featureId],
                feedbackProvided: true,
                lastTested: new Date()
            };
            updates.featureTesting = featureTesting;
        }

        await this.repository.updateParticipant(participantId, updates);
    }

    /**
     * Remove participant from program
     */
    public async removeParticipant(participantId: string): Promise<void> {
        await this.repository.updateParticipant(participantId, {
            status: 'removed'
        });
    }

    /**
     * Get list of active participants
     */
    public async getActiveParticipants(programId: string): Promise<BetaParticipant[]> {
        return this.repository.getAllParticipants({
            programId,
            status: ['active']
        });
    }

    /**
     * Get program statistics
     */
    public async getProgramStats(programId: string): Promise<{
        totalInvited: number;
        totalActive: number;
        totalDeclined: number;
        avgFeedbackPerParticipant: number;
        featureTestingCoverage: Record<string, number>;
    }> {
        const program = await this.repository.getProgram(programId);
        if (!program) {
            throw new Error(`Beta program with ID ${programId} not found`);
        }

        const participants = await this.repository.getAllParticipants({ programId });
        
        // Participant statistics by status
        const totalInvited = participants.filter(p => p.status === 'invited').length;
        const totalActive = participants.filter(p => p.status === 'active').length;
        const totalDeclined = participants.filter(p => p.status === 'declined').length;
        
        // Calculate average feedback per participant
        const totalFeedback = participants.reduce((sum, p) => sum + p.feedbackIds.length, 0);
        const avgFeedbackPerParticipant = totalActive > 0 ? totalFeedback / totalActive : 0;
        
        // Feature testing coverage
        const featureTestingCoverage: Record<string, number> = {};
        program.features.forEach(feature => {
            const testedCount = participants.filter(p => 
                p.status === 'active' && 
                p.featureTesting[feature.id]?.tested
            ).length;
            
            featureTestingCoverage[feature.id] = totalActive > 0 
                ? (testedCount / totalActive) * 100 
                : 0;
        });
        
        return {
            totalInvited,
            totalActive,
            totalDeclined,
            avgFeedbackPerParticipant,
            featureTestingCoverage
        };
    }
} 