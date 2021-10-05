// eslint-disable-next-line no-restricted-imports
import {Button} from '@blueprintjs/core';
import * as React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components/macro';

import {usePermissions} from '../app/Permissions';
import {ShortcutHandler} from '../app/ShortcutHandler';
import {Box} from '../ui/Box';
import {ButtonLink} from '../ui/ButtonLink';
import {ColorsWIP} from '../ui/Colors';
import {Group} from '../ui/Group';
import {IconWIP, IconWrapper} from '../ui/Icon';
import {Popover} from '../ui/Popover';
import {Spinner} from '../ui/Spinner';
import {Tooltip} from '../ui/Tooltip';
import {repoAddressAsString} from '../workspace/repoAddressAsString';
import {RepoAddress} from '../workspace/types';
import {workspacePathFromAddress} from '../workspace/workspacePath';

import {ReloadRepositoryLocationButton} from './ReloadRepositoryLocationButton';
import {RepoDetails, RepoSelector} from './RepoSelector';

interface Props {
  allRepos: RepoDetails[];
  selected: Set<RepoDetails>;
  onToggle: (repoAddress: RepoDetails) => void;
}

export const RepoNavItem: React.FC<Props> = (props) => {
  const {allRepos, selected, onToggle} = props;
  const [open, setOpen] = React.useState(false);

  const onInteraction = React.useCallback((nextState: boolean) => {
    setOpen(nextState);
  }, []);

  const summary = () => {
    if (allRepos.length === 0) {
      return <span style={{color: ColorsWIP.Gray600}}>No repositories</span>;
    }
    if (allRepos.length === 1) {
      return <SingleRepoSummary repoAddress={allRepos[0].repoAddress} />;
    }
    if (selected.size === 1) {
      const selectedRepo = Array.from(selected)[0];
      return <SingleRepoSummary repoAddress={selectedRepo.repoAddress} />;
    }
    return (
      <span style={{color: ColorsWIP.Gray100, fontWeight: 500, userSelect: 'none'}}>
        {`${selected.size} of ${allRepos.length} shown`}
      </span>
    );
  };

  return (
    <Box
      background={ColorsWIP.Gray900}
      border={{side: 'horizontal', width: 1, color: ColorsWIP.Gray800}}
      padding={{vertical: 8, horizontal: 12}}
    >
      <Box flex={{justifyContent: 'space-between'}}>
        <div style={{color: ColorsWIP.Gray400, fontSize: '10.5px', textTransform: 'uppercase'}}>
          Repository
        </div>
        {allRepos.length > 1 ? (
          <Popover
            canEscapeKeyClose
            isOpen={open}
            onInteraction={onInteraction}
            modifiers={{offset: {enabled: true, options: {offset: [0, 16]}}}}
            placement="right"
            popoverClassName="bp3-dark"
            content={
              <div style={{maxWidth: '600px', borderRadius: '3px'}}>
                <Box
                  padding={{vertical: 2, left: 8, right: 4}}
                  background={ColorsWIP.Gray800}
                  flex={{alignItems: 'center', justifyContent: 'space-between'}}
                >
                  <div style={{fontSize: '12px', color: ColorsWIP.Gray400}}>
                    {`Repositories (${selected.size} of ${allRepos.length} selected)`}
                  </div>
                  <Button icon="cross" small minimal onClick={() => setOpen(false)} />
                </Box>
                <Box padding={16}>
                  <RepoSelector options={allRepos} onToggle={onToggle} selected={selected} />
                </Box>
              </div>
            }
          >
            <ButtonLink color={ColorsWIP.Gray200} underline="hover">
              <span style={{fontSize: '11px', position: 'relative', top: '-4px'}}>Filter</span>
            </ButtonLink>
          </Popover>
        ) : null}
      </Box>
      {summary()}
    </Box>
  );
};

const SingleRepoSummary: React.FC<{repoAddress: RepoAddress}> = ({repoAddress}) => {
  const {canReloadRepositoryLocation} = usePermissions();
  return (
    <Group direction="row" spacing={4} alignItems="center">
      <SingleRepoNameLink
        to={workspacePathFromAddress(repoAddress)}
        title={repoAddressAsString(repoAddress)}
      >
        {repoAddress.name}
      </SingleRepoNameLink>
      {canReloadRepositoryLocation ? (
        <ReloadRepositoryLocationButton location={repoAddress.location}>
          {({tryReload, reloading}) => (
            <ShortcutHandler
              onShortcut={tryReload}
              shortcutLabel={`⌥R`}
              shortcutFilter={(e) => e.code === 'KeyR' && e.altKey}
            >
              <ReloadTooltip
                inheritDarkTheme={false}
                content={
                  <Reloading>
                    {reloading ? (
                      'Reloading…'
                    ) : (
                      <>
                        Reload location <strong>{repoAddress.location}</strong>
                      </>
                    )}
                  </Reloading>
                }
              >
                {reloading ? (
                  <Spinner purpose="body-text" />
                ) : (
                  <StyledButton onClick={tryReload}>
                    <IconWIP name="refresh" color={ColorsWIP.Gray200} />
                  </StyledButton>
                )}
              </ReloadTooltip>
            </ShortcutHandler>
          )}
        </ReloadRepositoryLocationButton>
      ) : null}
    </Group>
  );
};

const SingleRepoNameLink = styled(Link)`
  color: ${ColorsWIP.Gray100};
  display: block;
  max-width: 234px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  transition: color 100ms linear;

  && {
    color: ${ColorsWIP.Gray100};
    font-weight: 500;
  }

  &&:hover,
  &&:active {
    color: ${ColorsWIP.Gray50};
    text-decoration: none;
  }
`;

const ReloadTooltip = styled(Tooltip)`
  && {
    display: block;
  }
`;

const StyledButton = styled.button`
  background-color: transparent;
  border: 0;
  cursor: pointer;
  display: block;
  padding: 0;
  margin: 0;

  :focus:not(:focus-visible) {
    outline: none;
  }

  & ${IconWrapper} {
    transition: color 0.1s ease-in-out;
  }

  :hover ${IconWrapper} {
    color: ${ColorsWIP.Blue200};
  }
`;

const Reloading = styled.div`
  overflow-x: hidden;
  text-overflow: ellipsis;
  max-width: 600px;
  white-space: nowrap;
`;
