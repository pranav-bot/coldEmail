import useThreads from '@/hooks/use-threads';
import { api } from '@/trpc/react';
import { useState } from 'react';
import Avatar from 'react-avatar';
import Select from 'react-select';

type Props = {
    placeholder: string;
    label: string;
    onChange: (values: { label: string; value: string }[]) => void;
    value: { label: string; value: string }[];
    };

const TagInput = ({placeholder, label, onChange, value}: Props) => {
    const { accountId } = useThreads()
    const { data: suggestions } = api.account.getSuggestions.useQuery({
        accountId: accountId ?? "",
    });
    const [inputValue, setInputValue] = useState<string>('');
    const options =  suggestions?.map((suggestion) => ({
        label: (
            <span className='flex items-center gap-2'>
                <Avatar 
                name={suggestion.address}
                size='25'
                round={true}
                textSizeRatio={2}
                />
                {suggestion.address}
            </span>
        ),
        value: suggestion.address,
    })) ?? []
  return (
    <div className='border rounded-md flex items-center'>
        <span className='ml-3 text-sm text-gray-500'>
            {label}
        </span>
        <Select
        onInputChange={setInputValue}
        value={value}
        onChange={onChange}
        className='w-full flex-1' 
        options={inputValue ? options.concat({
            label: inputValue,
            value: inputValue,
        }) : options}
        placeholder={placeholder}
        isMulti
        classNames={{
            control: () => {
                return '!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent'
            },
            multiValue: () => {
                return 'dark:!bg-gray-700'
            },
            multiValueLabel: () => {
                return 'dark:text-white dark:bg-gray-700 rounded-md'
            }
        }}
        classNamePrefix="select"
        />
    </div>
  );
}

export default TagInput;